"""
Database module for Prisma integration with FastAPI
Provides connection management and database operations
"""

from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.config import settings
from app.logger import logger
import logging

# Import prisma client (will be auto-generated after schema setup)
try:
    from prisma import Prisma
    PRISMA_AVAILABLE = True
except ImportError:
    logger.warning("Prisma client not yet installed. Run: pip install prisma")
    PRISMA_AVAILABLE = False
    Prisma = None


class Database:
    """Database connection and operations manager"""

    def __init__(self):
        """Initialize database connection"""
        self._client: Optional[Prisma] = None

    async def connect(self) -> None:
        """Establish database connection"""
        if not PRISMA_AVAILABLE:
            raise RuntimeError("Prisma client not available. Run: prisma generate")

        try:
            self._client = Prisma()
            await self._client.connect()
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            raise

    async def disconnect(self) -> None:
        """Close database connection"""
        if self._client:
            await self._client.disconnect()
            logger.info("Database connection closed")

    @property
    def client(self) -> Prisma:
        """Get active client"""
        if not self._client:
            raise RuntimeError("Database not connected. Call connect() first")
        return self._client

    # User Operations
    async def create_user(self, email: str, username: str, password_hash: str) -> Dict[str, Any]:
        """Create new user"""
        try:
            user = await self.client.user.create(
                data={
                    "email": email,
                    "username": username,
                    "password_hash": password_hash,
                }
            )
            logger.info(f"User created: {email}")
            return user.dict()
        except Exception as e:
            logger.error(f"Failed to create user {email}: {str(e)}")
            raise

    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            user = await self.client.user.find_unique(where={"id": user_id})
            return user.dict() if user else None
        except Exception as e:
            logger.error(f"Failed to get user {user_id}: {str(e)}")
            return None

    # Session Operations
    async def create_session(
        self,
        user_id: str,
        trace_id: str,
        language: str = "en",
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create new session"""
        try:
            session = await self.client.session.create(
                data={
                    "user_id": user_id,
                    "trace_id": trace_id,
                    "language": language,
                    "context": context,
                    "status": "active",
                }
            )
            logger.info(f"Session created: {trace_id}")
            return session.dict()
        except Exception as e:
            logger.error(f"Failed to create session: {str(e)}")
            raise

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID"""
        try:
            session = await self.client.session.find_unique(where={"id": session_id})
            return session.dict() if session else None
        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {str(e)}")
            return None

    async def update_session_status(self, session_id: str, status: str) -> Dict[str, Any]:
        """Update session status"""
        try:
            session = await self.client.session.update(
                where={"id": session_id},
                data={"status": status, "completed_at": datetime.now() if status == "completed" else None}
            )
            logger.info(f"Session {session_id} status updated to {status}")
            return session.dict()
        except Exception as e:
            logger.error(f"Failed to update session {session_id}: {str(e)}")
            raise

    # Message Operations
    async def create_message(
        self,
        session_id: str,
        agent_id: str,
        agent_name: str,
        content: str,
        model_used: str,
        trace_id: str,
        tokens_used: int = 0,
        latency_ms: int = 0,
        quality_score: Optional[float] = None,
        error_message: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create message log"""
        try:
            message = await self.client.message.create(
                data={
                    "session_id": session_id,
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "content": content,
                    "model_used": model_used,
                    "trace_id": trace_id,
                    "tokens_used": tokens_used,
                    "latency_ms": latency_ms,
                    "quality_score": quality_score,
                    "error_message": error_message,
                    "is_complete": not error_message,
                }
            )
            logger.info(f"Message logged for agent {agent_id} in session {session_id}")
            return message.dict()
        except Exception as e:
            logger.error(f"Failed to create message: {str(e)}")
            raise

    async def get_session_messages(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all messages in a session"""
        try:
            messages = await self.client.message.find_many(
                where={"session_id": session_id},
                order_by={"created_at": "asc"}
            )
            return [msg.dict() for msg in messages]
        except Exception as e:
            logger.error(f"Failed to get session messages {session_id}: {str(e)}")
            return []

    # Request Log Operations
    async def log_request(
        self,
        trace_id: str,
        endpoint: str,
        method: str,
        status_code: int,
        execution_time_ms: int,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Log API request"""
        try:
            log = await self.client.request_log.create(
                data={
                    "trace_id": trace_id,
                    "endpoint": endpoint,
                    "method": method,
                    "status_code": status_code,
                    "execution_time_ms": execution_time_ms,
                    "user_agent": user_agent,
                    "ip_address": ip_address,
                }
            )
            return log.dict()
        except Exception as e:
            logger.error(f"Failed to log request {trace_id}: {str(e)}")
            raise

    async def get_request_logs(
        self,
        endpoint: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get request logs with filtering"""
        try:
            where = {}
            if endpoint:
                where["endpoint"] = endpoint

            logs = await self.client.request_log.find_many(
                where=where,
                order_by={"created_at": "desc"},
                skip=offset,
                take=limit
            )
            return [log.dict() for log in logs]
        except Exception as e:
            logger.error(f"Failed to get request logs: {str(e)}")
            return []

    # System Metrics Operations
    async def record_metric(
        self,
        metric_type: str,
        metric_name: str,
        metric_value: float,
        trace_id: Optional[str] = None,
        agent_id: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Record system metric"""
        try:
            metric = await self.client.system_metric.create(
                data={
                    "metric_type": metric_type,
                    "metric_name": metric_name,
                    "metric_value": metric_value,
                    "trace_id": trace_id,
                    "agent_id": agent_id,
                    "model": model,
                }
            )
            return metric.dict()
        except Exception as e:
            logger.error(f"Failed to record metric {metric_name}: {str(e)}")
            raise

    async def get_metrics(
        self,
        metric_type: Optional[str] = None,
        agent_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Get system metrics"""
        try:
            where = {}
            if metric_type:
                where["metric_type"] = metric_type
            if agent_id:
                where["agent_id"] = agent_id

            metrics = await self.client.system_metric.find_many(
                where=where,
                order_by={"created_at": "desc"},
                take=limit
            )
            return [m.dict() for m in metrics]
        except Exception as e:
            logger.error(f"Failed to get metrics: {str(e)}")
            return []

    # Cleanup Operations
    async def cleanup_old_sessions(self, days: int = 30) -> int:
        """Delete sessions older than N days"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = datetime.now() - timedelta(days=days)

            result = await self.client.session.delete_many(
                where={"created_at": {"lt": cutoff_date}}
            )
            logger.info(f"Deleted {result} old sessions")
            return result
        except Exception as e:
            logger.error(f"Failed to cleanup old sessions: {str(e)}")
            return 0


# Global database instance
db = Database()


@asynccontextmanager
async def get_db_context():
    """Context manager for database operations"""
    try:
        yield db
    finally:
        pass
