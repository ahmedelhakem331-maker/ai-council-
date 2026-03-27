"""
Observability Module - Middleware, Logging, and Metrics
Provides request/response logging, execution time tracking, and performance monitoring
"""

import time
import uuid
from typing import Callable, Optional
from datetime import datetime
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from app.logger import logger, log_with_trace
from app.config import settings
import json


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for comprehensive request/response logging
    Tracks execution time, headers, and request metadata
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.app = app

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and log comprehensive metrics

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/route handler

        Returns:
            Response with added headers
        """
        # Generate or extract trace ID
        trace_id = request.headers.get("x-trace-id", str(uuid.uuid4()))
        request.state.trace_id = trace_id
        request.state.start_time = time.time()

        # Extract useful info
        method = request.method
        url = str(request.url)
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        try:
            # Log incoming request
            log_with_trace(
                logger,
                "INFO",
                f"{method} {path} - Incoming request",
                trace_id,
                method=method,
                path=path,
                client_ip=client_ip,
                user_agent=user_agent[:100],  # Truncate for logs
            )

            # Call next middleware/route
            response = await call_next(request)

            # Calculate execution time
            execution_time_ms = int((time.time() - request.state.start_time) * 1000)

            # Add trace ID to response headers
            response.headers["x-trace-id"] = trace_id
            response.headers["x-execution-time-ms"] = str(execution_time_ms)

            # Log response
            log_with_trace(
                logger,
                "INFO",
                f"{method} {path} - Response {response.status_code}",
                trace_id,
                method=method,
                path=path,
                status_code=response.status_code,
                execution_time_ms=execution_time_ms,
                client_ip=client_ip,
            )

            # Try to log to database if available
            try:
                from app.database import db
                await db.log_request(
                    trace_id=trace_id,
                    endpoint=path,
                    method=method,
                    status_code=response.status_code,
                    execution_time_ms=execution_time_ms,
                    user_agent=user_agent,
                    ip_address=client_ip,
                )
            except Exception as db_error:
                logger.warning(f"Could not log request to database: {db_error}")

            return response

        except Exception as e:
            execution_time_ms = int((time.time() - request.state.start_time) * 1000)

            log_with_trace(
                logger,
                "ERROR",
                f"{method} {path} - Exception occurred",
                trace_id,
                method=method,
                path=path,
                error_type=type(e).__name__,
                error_message=str(e),
                execution_time_ms=execution_time_ms,
            )

            raise


class MetricsCollectorMiddleware(BaseHTTPMiddleware):
    """
    Middleware for collecting performance metrics
    Tracks latency, error rates, and model performance
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.metrics = {
            "total_requests": 0,
            "total_errors": 0,
            "total_execution_time_ms": 0,
            "endpoint_metrics": {},
        }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Collect metrics from requests"""
        path = request.url.path
        start_time = time.time()

        try:
            response = await call_next(request)
            execution_time_ms = int((time.time() - start_time) * 1000)

            # Update metrics
            self.metrics["total_requests"] += 1
            self.metrics["total_execution_time_ms"] += execution_time_ms

            # Per-endpoint metrics
            if path not in self.metrics["endpoint_metrics"]:
                self.metrics["endpoint_metrics"][path] = {
                    "count": 0,
                    "total_time_ms": 0,
                    "errors": 0,
                }

            self.metrics["endpoint_metrics"][path]["count"] += 1
            self.metrics["endpoint_metrics"][path]["total_time_ms"] += execution_time_ms

            return response

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)

            self.metrics["total_requests"] += 1
            self.metrics["total_errors"] += 1
            self.metrics["total_execution_time_ms"] += execution_time_ms

            if path not in self.metrics["endpoint_metrics"]:
                self.metrics["endpoint_metrics"][path] = {
                    "count": 0,
                    "total_time_ms": 0,
                    "errors": 0,
                }

            self.metrics["endpoint_metrics"][path]["count"] += 1
            self.metrics["endpoint_metrics"][path]["errors"] += 1
            self.metrics["endpoint_metrics"][path]["total_time_ms"] += execution_time_ms

            raise

    def get_metrics(self) -> dict:
        """Get current metrics"""
        avg_latency = (
            self.metrics["total_execution_time_ms"] / self.metrics["total_requests"]
            if self.metrics["total_requests"] > 0
            else 0
        )

        error_rate = (
            (self.metrics["total_errors"] / self.metrics["total_requests"]) * 100
            if self.metrics["total_requests"] > 0
            else 0
        )

        return {
            "total_requests": self.metrics["total_requests"],
            "total_errors": self.metrics["total_errors"],
            "average_latency_ms": avg_latency,
            "error_rate_percentage": error_rate,
            "endpoint_metrics": {
                path: {
                    **metrics,
                    "average_latency_ms": metrics["total_time_ms"] / metrics["count"]
                    if metrics["count"] > 0
                    else 0,
                }
                for path, metrics in self.metrics["endpoint_metrics"].items()
            },
            "timestamp": datetime.now().isoformat(),
        }


class ErrorTrackingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for detailed error tracking and reporting
    Creates structured error logs for debugging
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Track and log errors"""
        trace_id = getattr(request.state, "trace_id", str(uuid.uuid4()))

        try:
            response = await call_next(request)
            return response

        except Exception as e:
            log_with_trace(
                logger,
                "ERROR",
                f"Unhandled exception in {request.method} {request.url.path}",
                trace_id,
                error_type=type(e).__name__,
                error_message=str(e),
                path=request.url.path,
                method=request.method,
                query_params=dict(request.query_params),
            )

            # Try to record in database
            try:
                from app.database import db
                await db.record_metric(
                    metric_type="error",
                    metric_name=f"{type(e).__name__}_{request.url.path}",
                    metric_value=1.0,
                    trace_id=trace_id,
                )
            except Exception:
                pass

            raise


class AIAgentLoggingMiddleware(BaseHTTPMiddleware):
    """
    Specialized middleware for AI agent response logging
    Logs agent interactions, tokens, and quality scores
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log AI agent metrics"""
        trace_id = getattr(request.state, "trace_id", str(uuid.uuid4()))
        start_time = time.time()

        try:
            response = await call_next(request)
            execution_time_ms = int((time.time() - start_time) * 1000)

            # For WebSocket and streaming endpoints, additional logging happens there
            if "/ws" in request.url.path or "/stream" in request.url.path:
                log_with_trace(
                    logger,
                    "INFO",
                    f"AI streaming request completed",
                    trace_id,
                    path=request.url.path,
                    execution_time_ms=execution_time_ms,
                )

            return response

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)
            log_with_trace(
                logger,
                "ERROR",
                f"AI request failed",
                trace_id,
                path=request.url.path,
                error_type=type(e).__name__,
                execution_time_ms=execution_time_ms,
            )
            raise


# Global metrics collector instance
metrics_collector: Optional[MetricsCollectorMiddleware] = None


def get_metrics_collector() -> Optional[MetricsCollectorMiddleware]:
    """Get global metrics collector"""
    return metrics_collector


def set_metrics_collector(collector: MetricsCollectorMiddleware) -> None:
    """Set global metrics collector"""
    global metrics_collector
    metrics_collector = collector


# Utility function for logging agent responses
async def log_agent_response(
    trace_id: str,
    agent_id: str,
    agent_name: str,
    content: str,
    model_used: str,
    tokens_used: int,
    latency_ms: int,
    quality_score: Optional[float] = None,
    session_id: Optional[str] = None,
    error_message: Optional[str] = None,
) -> None:
    """
    Log AI agent response to database

    Args:
        trace_id: Request trace ID
        agent_id: Agent identifier
        agent_name: Human-readable agent name
        content: Response content
        model_used: LLM model used
        tokens_used: Tokens consumed
        latency_ms: Response latency in milliseconds
        quality_score: Optional quality assessment (0-10)
        session_id: Optional session ID for grouping
        error_message: Optional error message if request failed
    """
    try:
        from app.database import db

        log_with_trace(
            logger,
            "INFO",
            f"Agent {agent_name} response logged",
            trace_id,
            agent_id=agent_id,
            agent_name=agent_name,
            model=model_used,
            tokens=tokens_used,
            latency_ms=latency_ms,
            quality_score=quality_score,
            error=error_message,
        )

        # Log to database if session exists
        if session_id:
            await db.create_message(
                session_id=session_id,
                agent_id=agent_id,
                agent_name=agent_name,
                content=content[:5000],  # Truncate content if too large
                model_used=model_used,
                trace_id=trace_id,
                tokens_used=tokens_used,
                latency_ms=latency_ms,
                quality_score=quality_score,
                error_message=error_message,
            )

        # Record metrics
        await db.record_metric(
            metric_type="latency",
            metric_name=f"agent_{agent_id}_latency",
            metric_value=float(latency_ms),
            trace_id=trace_id,
            agent_id=agent_id,
            model=model_used,
        )

        if tokens_used > 0:
            await db.record_metric(
                metric_type="token_usage",
                metric_name=f"agent_{agent_id}_tokens",
                metric_value=float(tokens_used),
                trace_id=trace_id,
                agent_id=agent_id,
            )

        if quality_score is not None:
            await db.record_metric(
                metric_type="quality",
                metric_name=f"agent_{agent_id}_quality",
                metric_value=quality_score,
                trace_id=trace_id,
                agent_id=agent_id,
            )

    except Exception as e:
        logger.warning(f"Failed to log agent response: {str(e)}")
