"""
FastAPI Application Configuration
Environment variables and settings management using Pydantic v2
"""

from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "AI Council"
    APP_VERSION: str = "1.0.0"
    NODE_ENV: Literal["development", "production"] = "development"

    # Server
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MODEL_PRIMARY: str = "gpt-4o"
    OPENAI_MODEL_FALLBACK: str = "gpt-3.5-turbo"
    OPENAI_TIMEOUT_SECONDS: int = 5
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.7

    # Groq Configuration (Fallback)
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3-70b-versatile"
    GROQ_TIMEOUT_SECONDS: int = 10

    # DALL-E 3 Configuration
    DALLE3_MODEL: str = "dall-e-3"
    DALLE3_SIZE: str = "1024x1024"
    DALLE3_QUALITY: str = "standard"

    # JWT Configuration
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Database Configuration
    DATABASE_URL: str
    DATABASE_POOL_MIN: int = 2
    DATABASE_POOL_MAX: int = 10

    # Logging
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    LOG_FORMAT: Literal["json", "text"] = "json"
    ENABLE_STRUCTURED_LOGGING: bool = True
    ENABLE_TRACE_ID_CORRELATION: bool = True

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost"
    ]
    ALLOWED_WEBSOCKET_ORIGINS: list = [
        "ws://localhost:8000",
        "wss://localhost"
    ]

    # WebSocket Configuration
    WEBSOCKET_HEARTBEAT_INTERVAL: int = 30  # seconds
    WEBSOCKET_HEARTBEAT_TIMEOUT: int = 10   # seconds
    MAX_CONNECTIONS_PER_USER: int = 3
    CONNECTION_TIMEOUT: int = 60  # seconds

    # Quality Gate Configuration
    ENABLE_LLM_JUDGE: bool = True
    QUALITY_GATE_THRESHOLD: float = 3.0
    QUALITY_GATE_TIMEOUT_SECONDS: int = 10

    # Circuit Breaker Configuration
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 5
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT: int = 30  # seconds

    # Resilience Configuration
    MAX_RETRIES: int = 3
    RETRY_BACKOFF_BASE: float = 1.0
    RETRY_BACKOFF_MAX: float = 32.0

    # Admin Configuration
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "change_me_in_production"
    ENABLE_ADMIN_DASHBOARD: bool = True

    # Monitoring
    ENABLE_SENTRY: bool = False
    SENTRY_DSN: str = ""
    ENABLE_DATADOG: bool = False
    DATADOG_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
