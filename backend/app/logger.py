"""
Structured JSON logging with trace_id correlation
"""

import json
import logging
from datetime import datetime
from typing import Any, Optional, Dict
from uuid import uuid4
import sys


class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging"""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add trace_id if available in record
        if hasattr(record, "trace_id"):
            log_data["trace_id"] = record.trace_id

        # Add context fields
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)

        # Add exception info
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def setup_logger(name: str, level: str = "INFO") -> logging.Logger:
    """
    Setup a structured logger

    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Remove existing handlers
    logger.handlers.clear()

    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    # Add JSON formatter
    formatter = JSONFormatter()
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    logger.propagate = False

    return logger


def generate_trace_id() -> str:
    """Generate unique trace ID for request correlation"""
    return str(uuid4())


def log_with_trace(
    logger: logging.Logger,
    level: str,
    message: str,
    trace_id: str,
    **extra_fields
):
    """
    Log message with trace_id correlation

    Args:
        logger: Logger instance
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        message: Log message
        trace_id: Trace ID for correlation
        **extra_fields: Additional context fields
    """
    extra = {
        "trace_id": trace_id,
        "extra_fields": extra_fields
    }

    log_method = getattr(logger, level.lower(), logger.info)
    log_method(message, extra=extra)


# Stream logging helpers
def log_stream_start(
    logger: logging.Logger,
    trace_id: str,
    agent_id: str,
    model: str
):
    """Log stream start"""
    log_with_trace(
        logger,
        "INFO",
        "Stream started",
        trace_id,
        agent_id=agent_id,
        model=model,
        event="stream_start"
    )


def log_stream_token(
    logger: logging.Logger,
    trace_id: str,
    agent_id: str,
    token_index: int,
    model: str
):
    """Log stream token (verbose - consider sampling)"""
    log_with_trace(
        logger,
        "DEBUG",
        "Token streamed",
        trace_id,
        agent_id=agent_id,
        token_index=token_index,
        model=model
    )


def log_stream_complete(
    logger: logging.Logger,
    trace_id: str,
    agent_id: str,
    tokens_used: int,
    latency_ms: int,
    model: str,
    quality_score: Optional[float] = None
):
    """Log stream completion"""
    extra = {
        "agent_id": agent_id,
        "tokens_used": tokens_used,
        "latency_ms": latency_ms,
        "model": model,
        "event": "stream_complete"
    }
    if quality_score is not None:
        extra["quality_score"] = quality_score

    log_with_trace(logger, "INFO", "Stream completed", trace_id, **extra)


def log_fallback(
    logger: logging.Logger,
    trace_id: str,
    from_model: str,
    to_model: str,
    reason: str,
    tokens_so_far: int
):
    """Log model fallback event"""
    log_with_trace(
        logger,
        "WARNING",
        f"Fallback triggered: {from_model} -> {to_model}",
        trace_id,
        from_model=from_model,
        to_model=to_model,
        reason=reason,
        tokens_so_far=tokens_so_far,
        event="fallback_triggered"
    )


def log_error(
    logger: logging.Logger,
    trace_id: str,
    error_type: str,
    error_message: str,
    model: str,
    **extra
):
    """Log error"""
    log_with_trace(
        logger,
        "ERROR",
        f"{error_type}: {error_message}",
        trace_id,
        model=model,
        error_type=error_type,
        **extra
    )


# Global logger instance
logger = setup_logger(__name__)
