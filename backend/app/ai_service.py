"""
AI Service - OpenAI GPT-4o and Groq Llama-3 integration with streaming
"""

import asyncio
from typing import AsyncGenerator, Optional
from openai import AsyncOpenAI
from groq import AsyncGroq
from app.config import settings
from app.logger import logger, log_with_trace
import time


class AIService:
    """Handles communication with LLM providers"""

    def __init__(self):
        """Initialize AI clients"""
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.request_start_time: Optional[float] = None

    async def stream_openai(
        self,
        prompt: str,
        system_prompt: str,
        trace_id: str,
        agent_id: str,
        max_retries: int = 1,
    ) -> AsyncGenerator[str, None]:
        """
        Stream response from OpenAI GPT-4o

        Args:
            prompt: User prompt
            system_prompt: System prompt for agent
            trace_id: Unique request trace ID
            agent_id: Agent identifier
            max_retries: Maximum retry attempts

        Yields:
            Token chunks

        Raises:
            Exception: If all retries exhausted
        """
        self.request_start_time = time.time()
        last_error = None

        for attempt in range(max_retries):
            try:
                log_with_trace(
                    logger,
                    "INFO",
                    f"OpenAI request attempt {attempt + 1}/{max_retries}",
                    trace_id,
                    agent_id=agent_id,
                    model=settings.OPENAI_MODEL_PRIMARY,
                )

                # Create stream with timeout
                async with asyncio.timeout(settings.OPENAI_TIMEOUT_SECONDS):
                    stream = await self.openai_client.chat.completions.create(
                        model=settings.OPENAI_MODEL_PRIMARY,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt},
                        ],
                        temperature=settings.OPENAI_TEMPERATURE,
                        max_tokens=settings.OPENAI_MAX_TOKENS,
                        stream=True,
                    )

                    # Stream tokens
                    async for chunk in stream:
                        if chunk.choices[0].delta.content:
                            yield chunk.choices[0].delta.content

                    # Success - return early
                    return

            except asyncio.TimeoutError:
                last_error = f"Timeout after {settings.OPENAI_TIMEOUT_SECONDS}s"
                log_with_trace(
                    logger,
                    "WARNING",
                    f"OpenAI timeout: {last_error}",
                    trace_id,
                    agent_id=agent_id,
                    attempt=attempt + 1,
                )

            except Exception as e:
                last_error = str(e)
                log_with_trace(
                    logger,
                    "WARNING",
                    f"OpenAI error: {e.__class__.__name__}: {last_error}",
                    trace_id,
                    agent_id=agent_id,
                    attempt=attempt + 1,
                    error_type=e.__class__.__name__,
                )

                # Don't retry on non-transient errors
                if "401" in str(e) or "403" in str(e):
                    raise

        # All retries exhausted
        raise Exception(
            f"OpenAI failed after {max_retries} attempts: {last_error}"
        )

    async def stream_groq(
        self,
        prompt: str,
        system_prompt: str,
        trace_id: str,
        agent_id: str,
    ) -> AsyncGenerator[str, None]:
        """
        Stream response from Groq Llama-3

        Args:
            prompt: User prompt
            system_prompt: System prompt for agent
            trace_id: Unique request trace ID
            agent_id: Agent identifier

        Yields:
            Token chunks

        Raises:
            Exception: If request fails
        """
        self.request_start_time = time.time()

        try:
            log_with_trace(
                logger,
                "INFO",
                "Groq (fallback) request started",
                trace_id,
                agent_id=agent_id,
                model=settings.GROQ_MODEL,
            )

            async with asyncio.timeout(settings.GROQ_TIMEOUT_SECONDS):
                stream = await self.groq_client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=settings.OPENAI_TEMPERATURE,
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                    stream=True,
                )

                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content

        except asyncio.TimeoutError:
            error = f"Groq timeout after {settings.GROQ_TIMEOUT_SECONDS}s"
            log_with_trace(
                logger,
                "ERROR",
                error,
                trace_id,
                agent_id=agent_id,
                model=settings.GROQ_MODEL,
            )
            raise Exception(error)

        except Exception as e:
            log_with_trace(
                logger,
                "ERROR",
                f"Groq error: {e.__class__.__name__}: {str(e)}",
                trace_id,
                agent_id=agent_id,
                model=settings.GROQ_MODEL,
                error_type=e.__class__.__name__,
            )
            raise

    def get_request_duration_ms(self) -> int:
        """Get elapsed time since request started"""
        if self.request_start_time is None:
            return 0
        return int((time.time() - self.request_start_time) * 1000)
