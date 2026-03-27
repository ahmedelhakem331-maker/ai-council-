"""
WebSocket Connection Manager with heartbeat and connection tracking
"""

import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect, status
from datetime import datetime, timedelta
from app.logger import logger, log_with_trace
from app.config import settings


class ConnectionManager:
    """Manages WebSocket connections with heartbeat mechanism"""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_times: Dict[str, datetime] = {}
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> {conn_ids}
        self.heartbeat_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, user_id: str, conn_id: str):
        """
        Register new WebSocket connection

        Args:
            websocket: FastAPI WebSocket instance
            user_id: User identifier
            conn_id: Unique connection ID
        """
        await websocket.accept()

        # Check max connections per user
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()

        if len(self.user_connections[user_id]) >= settings.MAX_CONNECTIONS_PER_USER:
            await websocket.send_json({
                "type": "error",
                "message": f"Maximum {settings.MAX_CONNECTIONS_PER_USER} connections per user",
                "error_code": "MAX_CONNECTIONS_EXCEEDED"
            })
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Add connection
        self.active_connections[conn_id] = websocket
        self.connection_times[conn_id] = datetime.utcnow()
        self.user_connections[user_id].add(conn_id)

        logger.info(f"Connection established: {conn_id} (user: {user_id})")

        # Start heartbeat
        self.heartbeat_tasks[conn_id] = asyncio.create_task(
            self._heartbeat(websocket, conn_id, user_id)
        )

    async def disconnect(self, conn_id: str, user_id: str):
        """
        Unregister WebSocket connection

        Args:
            conn_id: Connection identifier
            user_id: User identifier
        """
        if conn_id in self.active_connections:
            del self.active_connections[conn_id]

        if conn_id in self.connection_times:
            del self.connection_times[conn_id]

        if user_id in self.user_connections:
            self.user_connections[user_id].discard(conn_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

        # Cancel heartbeat task
        if conn_id in self.heartbeat_tasks:
            self.heartbeat_tasks[conn_id].cancel()
            del self.heartbeat_tasks[conn_id]

        logger.info(f"Connection closed: {conn_id}")

    async def send_personal(self, conn_id: str, data: dict):
        """
        Send message to specific connection

        Args:
            conn_id: Connection identifier
            data: Message data
        """
        if conn_id in self.active_connections:
            try:
                await self.active_connections[conn_id].send_json(data)
            except Exception as e:
                logger.error(f"Failed to send message on {conn_id}: {e}")

    async def broadcast(self, message: dict, exclude_conn_id: str = None):
        """
        Broadcast message to all connections

        Args:
            message: Message data
            exclude_conn_id: Connection ID to exclude
        """
        disconnected = []

        for conn_id, websocket in self.active_connections.items():
            if exclude_conn_id and conn_id == exclude_conn_id:
                continue

            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send to {conn_id}: {e}")
                disconnected.append(conn_id)

        # Clean up disconnected
        for conn_id in disconnected:
            await self.disconnect(conn_id, None)

    async def _heartbeat(
        self,
        websocket: WebSocket,
        conn_id: str,
        user_id: str,
        interval: int = settings.WEBSOCKET_HEARTBEAT_INTERVAL
    ):
        """
        Send heartbeat to prevent zombie connections

        Args:
            websocket: WebSocket connection
            conn_id: Connection identifier
            user_id: User identifier
            interval: Heartbeat interval in seconds
        """
        try:
            while True:
                await asyncio.sleep(interval)

                try:
                    # Send ping
                    await websocket.send_json({
                        "type": "ping",
                        "timestamp": datetime.utcnow().isoformat()
                    })

                except Exception as e:
                    logger.warning(f"Heartbeat failed for {conn_id}: {e}")
                    await self.disconnect(conn_id, user_id)
                    break

        except asyncio.CancelledError:
            pass  # Task was cancelled, expected on disconnect

    def get_connection_stats(self) -> dict:
        """Get connection statistics"""
        total_connections = len(self.active_connections)
        total_users = len(self.user_connections)

        connection_ages = [
            (datetime.utcnow() - conn_time).total_seconds()
            for conn_time in self.connection_times.values()
        ]

        return {
            "active_connections": total_connections,
            "active_users": total_users,
            "average_connection_age_seconds": (
                sum(connection_ages) / len(connection_ages) if connection_ages else 0
            ),
            "oldest_connection_seconds": (
                max(connection_ages) if connection_ages else 0
            ),
        }
