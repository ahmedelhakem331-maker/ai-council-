"""
WebSocket routes for AI Council streaming
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Header, status
from fastapi.responses import HTMLResponse
import json
import asyncio
from uuid import uuid4
from typing import Optional
from datetime import datetime

from app.models import InitMessage, StreamToken, StreamMetadata, AgentInfo
from app.ai_cascade import AICascade
from app.logger import logger, log_with_trace, generate_trace_id, log_stream_complete
from app.websocket_manager import connection_manager
from app.config import settings

router = APIRouter()

# AI Cascade instance
ai_cascade = AICascade()

# Agent definitions
AGENTS = [
    AgentInfo(
        id="nova",
        name="Nova",
        role="Idea Generator",
        emoji="💡",
        color="cyan",
    ),
    AgentInfo(
        id="pixel",
        name="Pixel",
        role="Creative Enhancer",
        emoji="🎨",
        color="violet",
    ),
    AgentInfo(
        id="cipher",
        name="Cipher",
        role="Critical Analyst",
        emoji="🔍",
        color="rose",
    ),
    AgentInfo(
        id="vector",
        name="Vector",
        role="Business Strategist",
        emoji="📊",
        color="emerald",
    ),
    AgentInfo(
        id="apex",
        name="Apex",
        role="Chairman",
        emoji="👑",
        color="amber",
    ),
]

# Simple system prompts for demo (in production, fetch from database)
SYSTEM_PROMPTS = {
    "nova": "You are Nova, the creative idea generator. Your role is to expand ideas with creative possibilities and novel perspectives.",
    "pixel": "You are Pixel, the creative enhancer. Your role is to add artistic flair, visual depth, and emotional resonance to ideas.",
    "cipher": "You are Cipher, the critical analyst. Your role is to identify potential flaws, risks, and opportunities with logical rigor.",
    "vector": "You are Vector, the business strategist. Your role is to evaluate ideas for scalability, market fit, and revenue potential.",
    "apex": "You are Apex, the chairman. Your role is to synthesize all inputs and provide the final verdict on the idea.",
}


@router.websocket("/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    user_id: Optional[str] = Query("anonymous"),
):
    """
    WebSocket endpoint for real-time AI streaming

    Query parameters:
    - token: JWT token for authentication (optional for demo)
    - user_id: User identifier (defaults to "anonymous")
    """
    conn_id = str(uuid4())

    try:
        # Connect
        await connection_manager.connect(websocket, user_id, conn_id)
        log_with_trace(
            logger,
            "INFO",
            "WebSocket connected",
            generate_trace_id(),
            conn_id=conn_id,
            user_id=user_id,
        )

        # Listen for messages
        while True:
            # Receive initial message
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Validate message
            try:
                init_msg = InitMessage(**message_data)
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Invalid message format: {str(e)}",
                    "error_code": "INVALID_MESSAGE",
                    "trace_id": generate_trace_id(),
                })
                continue

            # Generate unique trace ID for this session
            trace_id = generate_trace_id()

            log_with_trace(
                logger,
                "INFO",
                "New chat session started",
                trace_id,
                user_id=user_id,
                idea_length=len(init_msg.idea),
                language=init_msg.language,
            )

            # Stream response from each agent
            for agent in AGENTS:
                try:
                    token_count = 0
                    start_time = datetime.utcnow()

                    # Send agent intro
                    await websocket.send_json({
                        "type": "agent_start",
                        "agent": agent.dict(),
                        "trace_id": trace_id,
                    })

                    # Get system prompt
                    system_prompt = SYSTEM_PROMPTS.get(
                        agent.id,
                        f"You are {agent.name}, {agent.role}.",
                    )

                    # Stream tokens with fallback
                    async for content, model_used, metadata in ai_cascade.stream_with_fallback(
                        prompt=init_msg.idea,
                        system_prompt=system_prompt,
                        trace_id=trace_id,
                        agent_id=agent.id,
                    ):
                        # Handle recovery signals
                        if model_used == "recovery_start":
                            await websocket.send_json({
                                "type": "recovery_start",
                                "from_model": metadata["from_model"],
                                "to_model": metadata["to_model"],
                                "reason": metadata["reason"],
                                "cursor": metadata["cursor"],
                                "trace_id": trace_id,
                            })
                            continue

                        elif model_used == "recovery_end":
                            await websocket.send_json({
                                "type": "recovery_end",
                                "model": metadata["model"],
                                "total_tokens": metadata["total_tokens"],
                                "trace_id": trace_id,
                            })
                            continue

                        elif model_used == "generic":
                            # Generic fallback response
                            await websocket.send_json({
                                "type": "error",
                                "message": content,
                                "error_code": "ALL_MODELS_FAILED",
                                "trace_id": trace_id,
                            })
                            continue

                        # Send token
                        if content:
                            token_count += 1
                            token_metadata = StreamMetadata(
                                model=model_used,
                                recovery=False,
                                cursor=token_count,
                                tokens_used=token_count,
                            )

                            await websocket.send_json({
                                "type": "token",
                                "content": content,
                                "agent": agent.dict(),
                                "trace_id": trace_id,
                                "meta": token_metadata.dict(),
                            })

                    # Send agent complete
                    duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                    await websocket.send_json({
                        "type": "agent_complete",
                        "agent_id": agent.id,
                        "tokens_used": token_count,
                        "latency_ms": duration,
                        "trace_id": trace_id,
                    })

                    log_stream_complete(
                        logger,
                        trace_id,
                        agent.id,
                        token_count,
                        duration,
                        "streamed",
                    )

                except WebSocketDisconnect:
                    log_with_trace(
                        logger,
                        "INFO",
                        "WebSocket disconnected during stream",
                        trace_id,
                        agent_id=agent.id,
                    )
                    raise

                except Exception as e:
                    log_with_trace(
                        logger,
                        "ERROR",
                        f"Error streaming agent {agent.id}: {str(e)}",
                        trace_id,
                        agent_id=agent.id,
                        error_type=type(e).__name__,
                    )
                    await websocket.send_json({
                        "type": "error",
                        "message": str(e),
                        "error_code": "STREAM_ERROR",
                        "trace_id": trace_id,
                    })

            # Send session complete
            await websocket.send_json({
                "type": "session_complete",
                "trace_id": trace_id,
                "timestamp": datetime.utcnow().isoformat(),
            })

    except WebSocketDisconnect:
        await connection_manager.disconnect(conn_id, user_id)

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await connection_manager.disconnect(conn_id, user_id)
