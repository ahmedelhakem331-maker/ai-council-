"""
Unit tests for database operations
Tests CRUD operations and data persistence
"""

import pytest
from unittest.mock import AsyncMock, patch
from app.database import Database


@pytest.mark.asyncio
class TestDatabaseConnection:
    """Tests for database connection management"""

    @pytest.fixture
    def db(self):
        """Create database instance"""
        return Database()

    async def test_connect_initializes_client(self, db):
        """Test that connect initializes Prisma client"""
        with patch("app.database.Prisma") as mock_prisma:
            mock_client = AsyncMock()
            mock_prisma.return_value = mock_client

            await db.connect()
            assert db._client is not None

    async def test_disconnect_closes_connection(self, db):
        """Test that disconnect closes connection"""
        with patch("app.database.Prisma") as mock_prisma:
            mock_client = AsyncMock()
            mock_prisma.return_value = mock_client

            await db.connect()
            await db.disconnect()

            mock_client.disconnect.assert_called_once()

    async def test_client_raises_without_connection(self, db):
        """Test that accessing client without connection raises error"""
        with pytest.raises(RuntimeError):
            _ = db.client


@pytest.mark.asyncio
class TestUserOperations:
    """Tests for user CRUD operations"""

    @pytest.fixture
    def db(self):
        """Create database instance"""
        db = Database()
        db._client = AsyncMock()
        return db

    async def test_create_user(self, db):
        """Test creating a new user"""
        db.client.user = AsyncMock()
        db.client.user.create = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "user-123",
                "email": "test@example.com",
                "username": "testuser"
            })
        )

        result = await db.create_user(
            email="test@example.com",
            username="testuser",
            password_hash="hashed_password"
        )

        assert result["id"] == "user-123"
        assert result["email"] == "test@example.com"
        db.client.user.create.assert_called_once()

    async def test_get_user(self, db):
        """Test retrieving user by ID"""
        db.client.user = AsyncMock()
        db.client.user.find_unique = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "user-123",
                "email": "test@example.com"
            })
        )

        result = await db.get_user("user-123")
        assert result["id"] == "user-123"

    async def test_get_user_not_found(self, db):
        """Test that get_user returns None when user not found"""
        db.client.user = AsyncMock()
        db.client.user.find_unique = AsyncMock(return_value=None)

        result = await db.get_user("nonexistent-id")
        assert result is None


@pytest.mark.asyncio
class TestSessionOperations:
    """Tests for session CRUD operations"""

    @pytest.fixture
    def db(self):
        """Create database instance"""
        db = Database()
        db._client = AsyncMock()
        return db

    async def test_create_session(self, db):
        """Test creating a new session"""
        db.client.session = AsyncMock()
        db.client.session.create = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "session-123",
                "user_id": "user-123",
                "trace_id": "trace-123",
                "status": "active"
            })
        )

        result = await db.create_session(
            user_id="user-123",
            trace_id="trace-123",
            language="en"
        )

        assert result["id"] == "session-123"
        assert result["status"] == "active"

    async def test_get_session(self, db):
        """Test retrieving session"""
        db.client.session = AsyncMock()
        db.client.session.find_unique = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "session-123",
                "status": "active"
            })
        )

        result = await db.get_session("session-123")
        assert result["id"] == "session-123"

    async def test_update_session_status(self, db):
        """Test updating session status"""
        db.client.session = AsyncMock()
        db.client.session.update = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "session-123",
                "status": "completed"
            })
        )

        result = await db.update_session_status("session-123", "completed")
        assert result["status"] == "completed"


@pytest.mark.asyncio
class TestMessageOperations:
    """Tests for message logging operations"""

    @pytest.fixture
    def db(self):
        """Create database instance"""
        db = Database()
        db._client = AsyncMock()
        return db

    async def test_create_message(self, db):
        """Test creating message log"""
        db.client.message = AsyncMock()
        db.client.message.create = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "msg-123",
                "session_id": "session-123",
                "agent_id": "nova",
                "content": "Test response",
                "tokens_used": 150
            })
        )

        result = await db.create_message(
            session_id="session-123",
            agent_id="nova",
            agent_name="Nova",
            content="Test response",
            model_used="gpt-4o",
            trace_id="trace-123",
            tokens_used=150,
            latency_ms=450
        )

        assert result["id"] == "msg-123"
        assert result["tokens_used"] == 150

    async def test_get_session_messages(self, db):
        """Test retrieving all messages in a session"""
        db.client.message = AsyncMock()
        db.client.message.find_many = AsyncMock(
            return_value=[
                AsyncMock(dict=lambda: {"id": "msg-1", "content": "First"}),
                AsyncMock(dict=lambda: {"id": "msg-2", "content": "Second"})
            ]
        )

        result = await db.get_session_messages("session-123")
        assert len(result) == 2
        assert result[0]["id"] == "msg-1"


@pytest.mark.asyncio
class TestMetricsOperations:
    """Tests for metrics recording"""

    @pytest.fixture
    def db(self):
        """Create database instance"""
        db = Database()
        db._client = AsyncMock()
        return db

    async def test_record_metric(self, db):
        """Test recording a metric"""
        db.client.system_metric = AsyncMock()
        db.client.system_metric.create = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "metric-123",
                "metric_type": "latency",
                "metric_value": 450.5
            })
        )

        result = await db.record_metric(
            metric_type="latency",
            metric_name="agent_latency",
            metric_value=450.5,
            agent_id="nova"
        )

        assert result["metric_type"] == "latency"
        assert result["metric_value"] == 450.5

    async def test_get_metrics(self, db):
        """Test retrieving metrics"""
        db.client.system_metric = AsyncMock()
        db.client.system_metric.find_many = AsyncMock(
            return_value=[
                AsyncMock(dict=lambda: {"id": "m1", "metric_type": "latency", "value": 100}),
                AsyncMock(dict=lambda: {"id": "m2", "metric_type": "latency", "value": 200})
            ]
        )

        result = await db.get_metrics(metric_type="latency")
        assert len(result) == 2


@pytest.mark.asyncio
class TestRequestLogging:
    """Tests for request logging"""

    @pytest.fixture
    def db(self):
        """Create database instance"""
        db = Database()
        db._client = AsyncMock()
        return db

    async def test_log_request(self, db):
        """Test logging an API request"""
        db.client.request_log = AsyncMock()
        db.client.request_log.create = AsyncMock(
            return_value=AsyncMock(dict=lambda: {
                "id": "log-123",
                "trace_id": "trace-123",
                "endpoint": "/api/v1/ws/chat",
                "status_code": 200,
                "execution_time_ms": 145
            })
        )

        result = await db.log_request(
            trace_id="trace-123",
            endpoint="/api/v1/ws/chat",
            method="GET",
            status_code=200,
            execution_time_ms=145
        )

        assert result["status_code"] == 200
        assert result["execution_time_ms"] == 145

    async def test_get_request_logs(self, db):
        """Test retrieving request logs"""
        db.client.request_log = AsyncMock()
        db.client.request_log.find_many = AsyncMock(
            return_value=[
                AsyncMock(dict=lambda: {"id": "log-1", "status_code": 200}),
                AsyncMock(dict=lambda: {"id": "log-2", "status_code": 500})
            ]
        )

        result = await db.get_request_logs(endpoint="/health")
        assert len(result) == 2
