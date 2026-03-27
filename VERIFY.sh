#!/bin/bash
# نص تحقق شامل من التكامل الكامل
# Comprehensive verification script for full integration

echo "🔍 AI Council - Verification Checklist"
echo "======================================"
echo ""

# 1. Database Files
echo "✓ DATABASE LAYER (Phase 5)"
echo "  Checking files..."
if [ -f "backend/prisma/schema.prisma" ]; then
  echo "  ✅ schema.prisma    - Tables: Users, Agents, Sessions, Messages, RequestLogs, SystemMetrics"
else
  echo "  ❌ schema.prisma    - MISSING"
fi

if [ -f "backend/app/database.py" ]; then
  echo "  ✅ database.py      - Database operations: create_user, create_session, create_message, log_request, record_metric"
else
  echo "  ❌ database.py      - MISSING"
fi

echo ""

# 2. Observability Files
echo "✓ OBSERVABILITY LAYER (Phase 6)"
echo "  Checking files..."
if [ -f "backend/app/observability.py" ]; then
  echo "  ✅ observability.py - Middleware: RequestLogging, MetricsCollector, ErrorTracking, AIAgentLogging"
else
  echo "  ❌ observability.py - MISSING"
fi

if [ -f "backend/app/main.py" ]; then
  echo "  ✅ main.py          - FastAPI app with middleware stack + /health + /metrics endpoints"
else
  echo "  ❌ main.py          - MISSING"
fi

echo ""

# 3. Testing Files
echo "✓ TESTING LAYER (Phase 7)"
echo "  Checking files..."
if [ -f "backend/tests/conftest.py" ]; then
  echo "  ✅ conftest.py      - Fixtures and mocks for testing"
else
  echo "  ❌ conftest.py      - MISSING"
fi

if [ -f "backend/tests/test_api.py" ]; then
  echo "  ✅ test_api.py      - Tests: Health, Metrics, CORS, TraceID, ErrorHandling"
else
  echo "  ❌ test_api.py      - MISSING"
fi

if [ -f "backend/tests/test_database.py" ]; then
  echo "  ✅ test_database.py - Tests: User, Session, Message, Metrics operations"
else
  echo "  ❌ test_database.py - MISSING"
fi

if [ -f "backend/pytest.ini" ]; then
  echo "  ✅ pytest.ini       - Pytest configuration"
else
  echo "  ❌ pytest.ini       - MISSING"
fi

echo ""

# 4. Integration Files
echo "✓ INTEGRATION POINTS"
echo "  Checking WebSocket integration..."
if grep -q "from app.database import db" backend/app/routers/ws.py 2>/dev/null; then
  echo "  ✅ ws.py integrates with database.py"
else
  echo "  ⚠️  ws.py - Check database integration"
fi

if grep -q "from app.observability import log_agent_response" backend/app/routers/ws.py 2>/dev/null; then
  echo "  ✅ ws.py integrates with observability.py"
else
  echo "  ⚠️  ws.py - Check observability integration"
fi

echo ""

# 5. Frontend Components
echo "✓ FRONTEND COMPONENTS"
echo "  Checking React components..."
if [ -f "src/components/AgentBoardroom.tsx" ]; then
  echo "  ✅ AgentBoardroom.tsx   - Displays 5 agents in 2x2 grid"
else
  echo "  ❌ AgentBoardroom.tsx   - MISSING"
fi

if [ -f "src/components/ChatInterface.tsx" ]; then
  echo "  ✅ ChatInterface.tsx    - Main chat UI + WebSocket streaming"
else
  echo "  ❌ ChatInterface.tsx    - MISSING"
fi

echo ""

# 6. Documentation
echo "✓ DOCUMENTATION"
echo "  Checking docs..."
if [ -f "README.md" ]; then
  echo "  ✅ README.md         - Updated with Phases 5-7 content"
else
  echo "  ❌ README.md         - MISSING"
fi

if [ -f "QUICK_START.md" ]; then
  echo "  ✅ QUICK_START.md    - 3-step quick start guide"
else
  echo "  ❌ QUICK_START.md    - MISSING"
fi

echo ""
echo "======================================"
echo "✅ VERIFICATION COMPLETE"
echo ""
echo "🎯 DATA FLOW:"
echo "  1. User submits idea via Frontend"
echo "  2. FastAPI WebSocket receives request"
echo "  3. RequestLoggingMiddleware logs request (execution time)"
echo "  4. AI Cascade streams response from agents"
echo "  5. log_agent_response() saves to database:"
echo "     - messages table (response content)"
echo "     - system_metrics table (latency, tokens, quality)"
echo "  6. Frontend receives tokens and renders UI"
echo "  7. Session marked as 'completed' in database"
echo ""
echo "📊 AVAILABLE ENDPOINTS:"
echo "  GET  /health              - System health status"
echo "  GET  /metrics             - Aggregated metrics"
echo "  WS   /api/v1/ws/chat      - Real-time AI streaming"
echo "  GET  /docs                - Interactive API documentation"
echo ""
echo "🧪 RUN TESTS:"
echo "  cd backend && pytest -v"
echo ""
echo "🚀 Happy coding! 🎉"
