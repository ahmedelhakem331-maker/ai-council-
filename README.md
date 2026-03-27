# 🏛️ AI Council - Enterprise-Grade Multi-Agent SaaS

**Five Minds. One Vision.** A production-ready platform where 5 specialized AI agents collaborate in real-time to analyze and enhance user ideas through collective intelligence.

## 🎯 Key Features

✅ **Real-time WebSocket Streaming** - Token-by-token response reveal with cinematic UI
✅ **Multi-Model Fallback** - GPT-4o → Groq-Llama-3 → GPT-3.5 with instant failover
✅ **Enterprise Resilience** - Circuit breaker, exponential backoff, cursor-based resume
✅ **Cinematic UI** - Glassmorphism + neon, Framer Motion animations, focal point design
✅ **Hybrid Storage** - LocalStorage + Supabase PostgreSQL with debounced sync
✅ **Full i18n** - English & Arabic with RTL support
✅ **Production-Ready** - Docker, Caddy proxy, structured logging, monitoring

## 🚀 Quick Start (Development)

### Prerequisites
- Docker & Docker Compose (optional - PostgreSQL can run locally)
- Node.js 18+, Python 3.11+
- PostgreSQL 14+ (for database)
- OpenAI & Groq API keys

### Local Development
```bash
# Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Database setup (Prisma)
npx prisma generate
npx prisma migrate dev --name init

# Start backend
python -m uvicorn app.main:app --reload

# Frontend (in new terminal)
npm install
npm run dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
# Health:   http://localhost:8000/health
```

**Or use Docker Compose:**
```bash
docker-compose up -d
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

## 🏗️ Architecture

```
Next.js Frontend (Port 3000)
    ↓ (WebSocket + HTTP)
Caddy Reverse Proxy (Ports 80/443)
    ↓
FastAPI Backend (Port 8000)
    ├─ WebSocket Streaming
    ├─ AI Cascade (GPT-4o → Groq → GPT-3.5)
    └─ Circuit Breaker + Recovery
    ↓
PostgreSQL (Neon.tech)
```

## 🤖 Agents

| Agent | Role | Emoji | Color |
|-------|------|-------|-------|
| Nova | Idea Generator | 💡 | Cyan |
| Pixel | Creative Enhancer | 🎨 | Violet |
| Cipher | Critical Analyst | 🔍 | Rose |
| Vector | Business Strategist | 📊 | Emerald |
| Apex | Chairman | 👑 | Amber |

## 📂 Project Structure

```
chrono-triangulum/
├── docker-compose.yml          # Multi-service orchestration
├── Dockerfile.frontend         # Next.js build
├── Caddyfile                  # Reverse proxy config
├── ARCHITECTURE.md            # System design
├── DEPLOYMENT.md              # Deployment guide
│
├── src/                        # Next.js Application
│   ├── app/
│   │   ├── api/              # BFF routes
│   │   ├── actions/          # Server actions
│   │   ├── dashboard/        # Dashboard page
│   │   └── layout.tsx
│   ├── components/           # React components
│   ├── hooks/               # Custom hooks (useSmartStream)
│   └── lib/                 # Utilities (jwt, localStorage)
│
└── backend/                  # FastAPI Application
    ├── app/
    │   ├── main.py          # FastAPI app + routes
    │   ├── config.py        # Settings & env vars
    │   ├── models.py        # Pydantic models
    │   ├── database.py      # Prisma database operations ⭐
    │   ├── observability.py # Middleware & metrics ⭐
    │   ├── ai_service.py    # OpenAI/Groq API
    │   ├── ai_cascade.py    # Fallback logic
    │   ├── websocket_manager.py  # WS connections
    │   ├── logger.py        # Structured logging
    │   └── routers/
    │       └── ws.py        # WebSocket routes
    ├── prisma/
    │   └── schema.prisma    # Database schema ⭐
    ├── tests/               # Unit tests ⭐
    │   ├── conftest.py      # Test fixtures
    │   ├── test_api.py      # API endpoint tests
    │   └── test_database.py # Database tests
    ├── requirements.txt     # Python dependencies
    └── pytest.ini          # Pytest configuration
```

## 🔑 Key Technologies

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- TanStack Query (SWR)
- Zustand (State)

**Backend:**
- FastAPI (async Python)
- OpenAI SDK + Groq SDK
- Prisma ORM
- PostgreSQL (Neon.tech)
- Structlog (JSON logging)

**DevOps:**
- Docker & Docker Compose
- Caddy (reverse proxy + SSL)
- Vercel (frontend) + Railway (backend)

## 🔄 Streaming Flow

1. User sends idea → Next.js UI
2. Optimistic update to LocalStorage + React state
3. WebSocket connects with JWT auth
4. FastAPI streams response (GPT-4o) token-by-token
5. **If GPT-4o times out** → instant switch to Groq-Llama-3
6. Recovery signal sent to frontend (visual indicator)
7. Stream continues seamlessly (no duplication)
8. On completion → debounced save to PostgreSQL
9. Quality Gate scores response asynchronously
10. Admin dashboard shows real-time metrics

## 📊 Resilience Features

- **5-second timeout** on primary model (GPT-4o)
- **Instant fallback** to Groq-Llama-3
- **Circuit breaker** pattern (opens after 5 failures)
- **Exponential backoff** retries (1s, 2s, 4s, 8s, 16s)
- **Cursor-based resume** for mid-stream recovery
- **Error boundaries** on frontend with state preservation
- **Offline support** via LocalStorage + Service Worker

## 🎬 UI/UX Highlights

- **Cinematic boardroom** with 5 agent cards
- **Focal point animation** - active agent glows, others dim
- **Sentence-by-sentence reveal** with 50ms stagger
- **Glassmorphism cards** with neon glow effects
- **Full-screen responsive** (mobile to desktop)
- **Dark theme only** (WCAG AA compliant)
- **Reduced-motion support** for accessibility

## 🔐 Security

- JWT authentication on WebSocket handshake
- CORS configured per environment
- Rate limiting (max 3 connections/user)
- Pydantic input validation
- SQL injection prevention (Prisma)
- Secrets in environment variables (never committed)
- HTTPS/SSL via Caddy or hosting provider

## 💾 Database Layer (Phase 5)

**Prisma Integration with PostgreSQL:**
- Type-safe database operations
- Auto-generated Prisma client
- Built-in migrations and schema management

**Supported Tables:**
- `users` - User accounts and authentication
- `agents` - AI agent definitions
- `sessions` - User sessions and contexts
- `messages` - Agent responses and message history
- `request_logs` - API request tracking
- `system_metrics` - Performance metrics

**Setup Database:**
```bash
# Inside backend directory
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create migrations
npx prisma db seed      # (Optional) seed initial data
```

**Usage Example:**
```python
from app.database import db

# Create session
session = await db.create_session(
    user_id="user-123",
    trace_id="unique-trace-id",
    language="en"
)

# Log message
await db.create_message(
    session_id=session['id'],
    agent_id="nova",
    agent_name="Nova",
    content="Response from agent",
    model_used="gpt-4o",
    trace_id="unique-trace-id",
    tokens_used=150,
    latency_ms=450
)

# Record metrics
await db.record_metric(
    metric_type="latency",
    metric_name="agent_nova_latency",
    metric_value=450.5,
    agent_id="nova"
)
```

## 🔍 Observability & Monitoring (Phase 6)

**Automatic Request Logging:**
- Every request logs execution time
- Trace ID correlation for debugging
- Client IP and user agent tracking
- Status codes and error tracking

**Available Endpoints:**

Health Check:
```bash
GET /health
# Returns: status, version, services health, uptime
```

Metrics:
```bash
GET /metrics
# Returns: request counts, latency, error rates, per-endpoint stats
```

**Middleware Stack:**
1. **RequestLoggingMiddleware** - Core request/response logging
2. **MetricsCollectorMiddleware** - Performance metrics collection
3. **ErrorTrackingMiddleware** - Exception tracking and logging
4. **AIAgentLoggingMiddleware** - Agent-specific metrics

**Structured Logging:**
All logs include:
- Timestamp
- Trace ID (for correlation)
- Log level (INFO, WARNING, ERROR)
- Contextual data (agent_id, model, tokens, latency_ms)
- Optional: stack traces for errors

**Agent Response Logging:**
```python
from app.observability import log_agent_response

await log_agent_response(
    trace_id="unique-trace-id",
    agent_id="nova",
    agent_name="Nova",
    content="Agent response text",
    model_used="gpt-4o",
    tokens_used=150,
    latency_ms=450,
    quality_score=8.5,
    session_id="session-123"
)
```

## 🧪 Testing (Phase 7)

**Run Tests:**
```bash
cd backend

# All tests
pytest -v

# Specific file
pytest tests/test_api.py -v

# With coverage
pytest --cov=app --cov-report=html

# Async tests only
pytest -m asyncio -v

# Stop on first failure
pytest -x
```

**Test Coverage:**
- ✅ API endpoints (health, metrics)
- ✅ Trace ID propagation
- ✅ CORS headers
- ✅ Error handling
- ✅ Database CRUD operations
- ✅ Metrics collection and reporting
- ✅ Request logging

**Test Files:**
- `tests/conftest.py` - Shared fixtures and mocks
- `tests/test_api.py` - API endpoint tests
- `tests/test_database.py` - Database operation tests

**Sample Test:**
```python
def test_health_check_returns_200(self):
    response = self.client.get("/health")
    assert response.status_code == 200

def test_trace_id_added_to_response(self):
    response = self.client.get("/health")
    assert "x-trace-id" in response.headers
```

**Pytest Configuration:**
Edit `pytest.ini` to customize:
- Test discovery patterns
- Async mode (auto)
- Markers for categorization
- Coverage options
- Timeout for slow tests

## 📈 Monitoring

```bash
# Health status
curl http://localhost:8000/health

# Connection stats
curl http://localhost:8000/stats

# Admin dashboard
http://localhost:8000/admin/logs

# Structured logs (JSON)
docker-compose logs -f backend | jq .
```

## 🚢 Deployment

### Development
```bash
docker-compose up -d
```

### Production
- **Frontend**: Deploy to Vercel (One-click from GitHub)
- **Backend**: Deploy to Railway (Auto-build from Docker)
- **Database**: Neon.tech PostgreSQL (serverless)
- **Proxy**: Caddy on your domain (auto SSL)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📦 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
```

### Backend (.env)
```env
OPENAI_API_KEY=sk_xxx
GROQ_API_KEY=gsk_xxx
JWT_SECRET=min_32_char_secret
DATABASE_URL=postgresql://...
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest -v

# Frontend e2e
npm run test:e2e
```

## 🔗 Quick Links

- 📖 [Architecture](./ARCHITECTURE.md)
- 🚀 [Deployment](./DEPLOYMENT.md)
- 📄 [API Docs](http://localhost:8000/docs) (local)
- 🎨 [Design System](./src/app/globals.css)

## 📝 License

MIT

---

**Built with** ❤️ **using FastAPI, Next.js, and PostgreSQL**

