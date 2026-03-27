"""
Pytest configuration and fixtures for testing the AI Council application
"""

import pytest
import asyncio
from typing import Generator, AsyncGenerator
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from unittest.mock import AsyncMock, MagicMock, patch
import os

# Set test environment
os.environ["NODE_ENV"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["OPENAI_API_KEY"] = "test-key"
os.environ["GROQ_API_KEY"] = "test-key"
os.environ["JWT_SECRET"] = "test-secret"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def client() -> TestClient:
    """Create test client"""
    from app.main import app
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Create async test client"""
    from httpx import AsyncClient
    from app.main import app

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def mock_openai():
    """Mock OpenAI client"""
    with patch("app.ai_service.AsyncOpenAI") as mock:
        mock_instance = AsyncMock()
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_groq():
    """Mock Groq client"""
    with patch("app.ai_service.AsyncGroq") as mock:
        mock_instance = AsyncMock()
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
async def mock_db():
    """Mock database"""
    with patch("app.database.db") as mock:
        mock.client = AsyncMock()
        mock.connect = AsyncMock()
        mock.disconnect = AsyncMock()
        mock.create_session = AsyncMock(return_value={"id": "test-session-id"})
        mock.create_message = AsyncMock(return_value={"id": "test-message-id"})
        mock.log_request = AsyncMock()
        mock.record_metric = AsyncMock()
        yield mock


@pytest.fixture
def sample_request_data():
    """Sample request data for tests"""
    return {
        "idea": "How can I improve my productivity?",
        "language": "en",
        "context": {
            "domain": "personal-development",
            "user_level": "intermediate"
        }
    }


@pytest.fixture
def sample_stream_data():
    """Sample streaming response data"""
    return {
        "type": "token",
        "content": "This is a sample response",
        "agent": {
            "id": "nova",
            "name": "Nova",
            "role": "Idea Generator",
            "emoji": "✨",
            "color": "cyan"
        },
        "trace_id": "test-trace-123",
        "meta": {
            "model": "gpt-4o",
            "recovery": False,
            "cursor": 0,
            "tokens_used": 10,
            "latency_ms": 100
        }
    }


@pytest.fixture
def sample_session():
    """Sample session data"""
    return {
        "id": "session-123",
        "user_id": "user-123",
        "trace_id": "trace-123",
        "language": "en",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z"
    }


@pytest.fixture
def sample_message():
    """Sample message data"""
    return {
        "id": "msg-123",
        "session_id": "session-123",
        "agent_id": "nova",
        "agent_name": "Nova",
        "content": "Here's a great idea for you...",
        "model_used": "gpt-4o",
        "tokens_used": 150,
        "latency_ms": 450,
        "quality_score": 8.5,
        "trace_id": "trace-123",
        "is_complete": True,
        "created_at": "2024-01-01T00:00:10Z"
    }
