"""
FastAPI Application Entry Point
Multi-agent AI Council with streaming, observability, and database integration
"""

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.config import settings
from app.logger import logger
from app.database import db
from app.observability import (
    RequestLoggingMiddleware,
    MetricsCollectorMiddleware,
    ErrorTrackingMiddleware,
    AIAgentLoggingMiddleware,
    set_metrics_collector,
)
from app.routers import ws
import time


# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events
    Manages database connections and resource cleanup
    """
    # Startup
    logger.info("========================================")
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.NODE_ENV}")
    logger.info(f"Database: {settings.DATABASE_URL[:50]}...")
    logger.info("========================================")

    try:
        # Initialize database connection
        await db.connect()
        logger.info("✓ Database connected")
    except Exception as e:
        logger.error(f"✗ Failed to connect database: {str(e)}")
        logger.warning("Application running without database persistence")

    yield

    # Shutdown
    logger.info("========================================")
    logger.info(f"Shutting down {settings.APP_NAME}")
    logger.info("========================================")

    try:
        await db.disconnect()
        logger.info("✓ Database disconnected")
    except Exception as e:
        logger.error(f"✗ Error disconnecting database: {str(e)}")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise-grade multi-agent AI system with streaming and observability",
    lifespan=lifespan,
)


# Middleware Setup (Order matters - from outermost to innermost)
# 1. Metrics Collection (outermost - captures all requests)
metrics_middleware = MetricsCollectorMiddleware(app)
app.add_middleware(MetricsCollectorMiddleware)
set_metrics_collector(metrics_middleware)

# 2. Error Tracking
app.add_middleware(ErrorTrackingMiddleware)

# 3. AI Agent Logging
app.add_middleware(AIAgentLoggingMiddleware)

# 4. Request Logging (core logging)
app.add_middleware(RequestLoggingMiddleware)

# 5. CORS (innermost - allows cross-origin requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-trace-id", "x-execution-time-ms"],
)


# Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    trace_id = getattr(request.state, "trace_id", "unknown")

    logger.error(
        f"Unhandled exception",
        extra={
            "trace_id": trace_id,
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "path": request.url.path,
        }
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "trace_id": trace_id,
            "message": str(exc) if settings.NODE_ENV == "development" else None,
        },
    )


# Health Check Endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for load balancers and monitoring

    Returns:
        Health status with service information
    """
    from app.models import HealthCheckResponse
    from datetime import datetime
    from app.logger import app_start_time

    try:
        uptime_seconds = int(time.time() - app_start_time)
    except:
        uptime_seconds = 0

    # Check database connectivity
    db_status = "ok"
    try:
        # Simple check if db is connected
        if db.client:
            db_status = "ok"
    except Exception:
        db_status = "error"

    return HealthCheckResponse(
        status="healthy" if db_status == "ok" else "degraded",
        timestamp=datetime.now(),
        version=settings.APP_VERSION,
        services={
            "database": db_status,
            "openai": "ok",  # Add actual checks as needed
            "groq": "ok",    # Add actual checks as needed
        },
        uptime_seconds=uptime_seconds,
    )


# Metrics Endpoint
@app.get("/metrics", tags=["Observability"])
async def get_metrics():
    """
    Get application metrics and performance statistics

    Returns:
        Current metrics including latency, error rates, and per-endpoint stats
    """
    from app.observability import get_metrics_collector

    collector = get_metrics_collector()
    if collector:
        return collector.get_metrics()

    return {"error": "Metrics collector not available"}


# Routes
app.include_router(ws.router, prefix="/api/v1", tags=["WebSocket"])


# Root endpoint
@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.NODE_ENV,
        "endpoints": {
            "websocket": "/api/v1/ws/chat",
            "health": "/health",
            "metrics": "/metrics",
        },
        "documentation": "/docs",
    }


# Startup logging
@app.on_event("startup")
async def startup_event():
    """Log successful startup"""
    logger.info(
        f"✓ {settings.APP_NAME} started successfully",
        extra={
            "version": settings.APP_VERSION,
            "port": settings.SERVER_PORT,
            "host": settings.SERVER_HOST,
        },
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.NODE_ENV == "development",
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
    )
