"""
AI Cascade Service - Multi-model fallback with circuit breaker pattern
"""

import asyncio
import time
from typing import AsyncGenerator, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
from app.ai_service import AIService
from app.logger import logger, log_with_trace, log_fallback
from app.config import settings


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"  # Normal operation
    OPEN = "open"      # Failing fast
    HALF_OPEN = "half_open"  # Testing recovery


class CircuitBreaker:
    """Circuit breaker for API endpoints"""

    def __init__(
        self,
        failure_threshold: int = settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
        recovery_timeout: int = settings.CIRCUIT_BREAKER_RECOVERY_TIMEOUT,
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.last_success_time: Optional[datetime] = None

    def record_success(self):
        """Record successful request"""
        self.failure_count = 0
        self.last_success_time = datetime.utcnow()
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.CLOSED
            logger.info("Circuit breaker CLOSED (recovered)")

    def record_failure(self):
        """Record failed request"""
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.warning(
                f"Circuit breaker OPEN (failures: {self.failure_count})"
            )

    def is_available(self) -> bool:
        """Check if circuit allows requests"""
        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            # Check if recovery window has passed
            if self.last_failure_time:
                elapsed = (datetime.utcnow() - self.last_failure_time).total_seconds()
                if elapsed > self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.failure_count = 0
                    logger.info("Circuit breaker HALF_OPEN (testing recovery)")
                    return True
            return False

        return True  # HALF_OPEN


class AICascade:
    """
    Multi-model fallback cascade with circuit breaker

    Primary: GPT-4o (5s timeout)
    ├─ Fallback 1: Groq Llama-3 (10s timeout)
    ├─ Fallback 2: GPT-3.5-turbo (8s timeout)
    └─ Fallback 3: Generic response (cache)
    """

    def __init__(self):
        self.ai_service = AIService()
        self.openai_circuit = CircuitBreaker()
        self.groq_circuit = CircuitBreaker()
        self.cache: dict = {}  # Simple response cache

    async def stream_with_fallback(
        self,
        prompt: str,
        system_prompt: str,
        trace_id: str,
        agent_id: str,
    ) -> AsyncGenerator[Tuple[str, str, dict], None]:
        """
        Stream response with automatic fallback cascade

        Yields:
            Tuple of (content, model_used, metadata_dict)
        """
        model_used = None
        tokens_used = 0
        start_time = time.time()

        # Model cascade order
        models = [
            ("gpt-4o", "primary", self.openai_circuit),
            ("groq-llama3", "fallback1", self.groq_circuit),
            ("gpt-3.5-turbo", "fallback2", self.openai_circuit),
        ]

        for i, (model_name, model_type, circuit) in enumerate(models):
            if not circuit.is_available():
                log_with_trace(
                    logger,
                    "WARNING",
                    f"Circuit breaker OPEN for {model_name}, skipping",
                    trace_id,
                    agent_id=agent_id,
                    model=model_name,
                )
                continue

            model_used = model_name
            is_recovery = i > 0  # Recovery if not primary

            if is_recovery:
                log_fallback(
                    logger,
                    trace_id,
                    models[i - 1][0],
                    model_name,
                    "previous model failed or timed out",
                    tokens_used,
                )

                # Send recovery signal
                yield (
                    "",
                    "recovery_start",
                    {
                        "from_model": models[i - 1][0],
                        "to_model": model_name,
                        "reason": "timeout or error",
                        "cursor": tokens_used,
                    },
                )

            try:
                # Stream from current model
                token_index = 0

                if model_type == "primary":
                    async for token in self.ai_service.stream_openai(
                        prompt, system_prompt, trace_id, agent_id
                    ):
                        tokens_used += 1
                        token_index += 1
                        yield (token, model_name, {"index": token_index})

                elif model_type == "fallback1":
                    async for token in self.ai_service.stream_groq(
                        prompt, system_prompt, trace_id, agent_id
                    ):
                        tokens_used += 1
                        token_index += 1
                        yield (token, model_name, {"index": token_index})

                elif model_type == "fallback2":
                    # GPT-3.5 as fallback
                    async for token in self.ai_service.stream_openai(
                        prompt, system_prompt, trace_id, agent_id, max_retries=1
                    ):
                        tokens_used += 1
                        token_index += 1
                        yield (token, model_name, {"index": token_index})

                # Success - record and exit loop
                circuit.record_success()

                if is_recovery:
                    yield (
                        "",
                        "recovery_end",
                        {"model": model_name, "total_tokens": tokens_used},
                    )

                duration_ms = int((time.time() - start_time) * 1000)
                log_with_trace(
                    logger,
                    "INFO",
                    f"Stream completed with {model_name}",
                    trace_id,
                    agent_id=agent_id,
                    model=model_name,
                    tokens_used=tokens_used,
                    latency_ms=duration_ms,
                )

                return  # Successfully completed

            except asyncio.TimeoutError as e:
                circuit.record_failure()
                log_with_trace(
                    logger,
                    "WARNING",
                    f"{model_name} timeout, trying next model",
                    trace_id,
                    agent_id=agent_id,
                    model=model_name,
                    error_type="TimeoutError",
                )
                continue

            except Exception as e:
                circuit.record_failure()
                log_with_trace(
                    logger,
                    "WARNING",
                    f"{model_name} error: {str(e)}, trying next model",
                    trace_id,
                    agent_id=agent_id,
                    model=model_name,
                    error_type=type(e).__name__,
                )
                continue

        # All models failed - return generic response
        log_with_trace(
            logger,
            "ERROR",
            "All models failed, returning generic response",
            trace_id,
            agent_id=agent_id,
            models_attempted=len(models),
        )

        yield (
            "I apologize, but I'm currently experiencing technical difficulties. "
            "Please try again in a few moments.",
            "generic",
            {"fallback": True},
        )
