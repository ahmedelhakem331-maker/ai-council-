"""
Pydantic models for FastAPI request/response validation and WebSocket messages
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal
from datetime import datetime
from uuid import UUID


# Agent Models
class AgentInfo(BaseModel):
    """Agent information sent with stream chunks"""
    id: str = Field(..., description="Agent identifier (e.g., 'nova', 'pixel')")
    name: str = Field(..., description="Human-readable agent name")
    role: str = Field(..., description="Agent role (e.g., 'Idea Generator')")
    emoji: str = Field(..., description="Agent emoji avatar")
    color: str = Field(..., description="Brand color for UI (e.g., 'cyan')")


class AgentDefinition(BaseModel):
    """Complete agent definition with system prompt"""
    id: str
    name: str
    role: str
    emoji: str
    color: str
    system_prompt: str = Field(..., description="System prompt for LLM")
    description: str = Field(default="", description="Agent description")


# WebSocket Message Models
class StreamMetadata(BaseModel):
    """Metadata for stream chunks"""
    model: str = Field(..., description="LLM model used (e.g., 'gpt-4o')")
    recovery: bool = Field(default=False, description="True if from fallback model")
    cursor: int = Field(default=0, description="Token index for resuming")
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None


class StreamToken(BaseModel):
    """Token chunk in stream"""
    type: Literal["token"] = "token"
    content: str = Field(..., description="Text content")
    agent: AgentInfo
    trace_id: str = Field(..., description="Unique session trace ID")
    meta: StreamMetadata


class RecoveryStart(BaseModel):
    """Signal when model fallback occurs"""
    type: Literal["recovery_start"] = "recovery_start"
    from_model: str = Field(..., description="Original model that failed")
    to_model: str = Field(..., description="Fallback model")
    reason: str = Field(..., description="Reason for switch")
    cursor: int = Field(default=0, description="Last token index before switch")
    trace_id: str


class RecoveryEnd(BaseModel):
    """Signal when recovery completes"""
    type: Literal["recovery_end"] = "recovery_end"
    model: str = Field(..., description="Model that recovered")
    total_tokens: int
    trace_id: str


class StreamComplete(BaseModel):
    """Signal when streaming completes"""
    type: Literal["complete"] = "complete"
    agent_id: str
    total_tokens: int
    latency_ms: int
    trace_id: str
    quality_score: Optional[float] = None


class StreamError(BaseModel):
    """Error during streaming"""
    type: Literal["error"] = "error"
    message: str
    error_code: str
    trace_id: str
    can_retry: bool = False


class InitMessage(BaseModel):
    """Initial message from client to start streaming"""
    idea: str = Field(..., min_length=1, max_length=10000, description="User's idea")
    language: str = Field(default="en", pattern="^[a-z]{2}(-[A-Z]{2})?$")
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


# API Request/Response Models
class ChatRequest(BaseModel):
    """API request for chat"""
    idea: str = Field(..., min_length=1, max_length=10000)
    language: str = Field(default="en")


class ChatResponse(BaseModel):
    """API response with full responses"""
    responses: list[Dict[str, Any]]
    trace_id: str
    timestamp: datetime
    total_duration_ms: int


class MessageLog(BaseModel):
    """Database message model"""
    id: str
    session_id: str
    agent_id: str
    agent_name: str
    content: str
    model_used: str
    tokens_used: int
    latency_ms: int
    quality_score: Optional[float] = None
    trace_id: str
    is_complete: bool
    created_at: datetime
    updated_at: datetime


# Health Check Models
class HealthCheckResponse(BaseModel):
    """System health status"""
    status: Literal["healthy", "degraded", "unhealthy"]
    timestamp: datetime
    version: str
    services: Dict[str, Literal["ok", "error"]]
    uptime_seconds: int


# Admin Models
class LogEntry(BaseModel):
    """Log entry for admin dashboard"""
    timestamp: datetime
    trace_id: str
    agent_id: str
    model: str
    tokens: int
    latency_ms: int
    quality_score: Optional[float]
    status: Literal["success", "fallback", "error"]
    error_message: Optional[str] = None


class PerformanceMetrics(BaseModel):
    """Performance metrics summary"""
    total_requests: int
    average_latency_ms: float
    total_tokens_processed: int
    fallback_rate: float  # percentage
    error_rate: float  # percentage
    average_quality_score: float
    timestamp: datetime
