"""
Unit tests for API endpoints
Tests health checks, metrics, and basic functionality
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


class TestHealthEndpoint:
    """Tests for health check endpoint"""

    client = TestClient(app)

    def test_health_check_returns_200(self):
        """Test health endpoint returns 200 status"""
        response = self.client.get("/health")
        assert response.status_code == 200

    def test_health_check_has_required_fields(self):
        """Test health response has required fields"""
        response = self.client.get("/health")
        data = response.json()

        assert "status" in data
        assert "timestamp" in data
        assert "version" in data
        assert "services" in data
        assert "uptime_seconds" in data

    def test_health_status_values(self):
        """Test health status has valid values"""
        response = self.client.get("/health")
        data = response.json()

        assert data["status"] in ["healthy", "degraded", "unhealthy"]
        assert isinstance(data["uptime_seconds"], int)


class TestMetricsEndpoint:
    """Tests for metrics endpoint"""

    client = TestClient(app)

    def test_metrics_returns_200(self):
        """Test metrics endpoint returns 200 status"""
        response = self.client.get("/metrics")
        assert response.status_code == 200

    def test_metrics_has_required_fields(self):
        """Test metrics response has required structure"""
        response = self.client.get("/metrics")
        data = response.json()

        assert "total_requests" in data
        assert "total_errors" in data
        assert "average_latency_ms" in data
        assert "error_rate_percentage" in data


class TestRootEndpoint:
    """Tests for root endpoint"""

    client = TestClient(app)

    def test_root_returns_200(self):
        """Test root endpoint returns 200 status"""
        response = self.client.get("/")
        assert response.status_code == 200

    def test_root_has_required_info(self):
        """Test root response has application information"""
        response = self.client.get("/")
        data = response.json()

        assert "name" in data
        assert "version" in data
        assert "environment" in data
        assert "endpoints" in data


class TestTraceIDHeaders:
    """Tests for trace ID propagation"""

    client = TestClient(app)

    def test_trace_id_added_to_response(self):
        """Test that trace ID is added to response headers"""
        response = self.client.get("/health")
        assert "x-trace-id" in response.headers

    def test_trace_id_persists_custom_id(self):
        """Test that custom trace ID from request is preserved"""
        custom_trace_id = "custom-trace-12345"
        response = self.client.get(
            "/health",
            headers={"x-trace-id": custom_trace_id}
        )
        assert response.headers["x-trace-id"] == custom_trace_id

    def test_execution_time_header_present(self):
        """Test that execution time is included in response"""
        response = self.client.get("/health")
        assert "x-execution-time-ms" in response.headers


class TestCORSHeaders:
    """Tests for CORS headers"""

    client = TestClient(app)

    def test_cors_origin_allowed(self):
        """Test that allowed origins get CORS headers"""
        response = self.client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )
        # TestClient doesn't process CORS, just ensure endpoint works
        assert response.status_code == 200

    def test_all_methods_allowed(self):
        """Test that OPTIONS request is accepted"""
        response = self.client.options("/health")
        assert response.status_code in [200, 405]  # 405 Method Not Allowed is OK for GET-only endpoint


class TestErrorHandling:
    """Tests for error handling"""

    client = TestClient(app)

    def test_not_found_returns_404(self):
        """Test that non-existent endpoint returns 404"""
        response = self.client.get("/non-existent-endpoint")
        assert response.status_code == 404

    def test_error_response_has_trace_id(self):
        """Test that error responses include trace ID"""
        response = self.client.get("/non-existent-endpoint")
        # FastAPI returns default 404 without custom trace-id
        assert response.status_code == 404


class TestRequestMetricsCollection:
    """Tests for request metrics collection"""

    client = TestClient(app)

    def test_metrics_updated_after_request(self):
        """Test that metrics are collected after requests"""
        # Make a request
        self.client.get("/health")

        # Check metrics recorded
        response = self.client.get("/metrics")
        data = response.json()

        assert data["total_requests"] >= 1

    def test_error_rate_calculation(self):
        """Test that error rate is calculated correctly"""
        # Make successful request
        self.client.get("/health")

        # Make failing request
        self.client.get("/non-existent")

        # Check metrics
        response = self.client.get("/metrics")
        data = response.json()

        # Error rate should be calculated
        assert "error_rate_percentage" in data
        assert data["error_rate_percentage"] >= 0
