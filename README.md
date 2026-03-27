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
- Docker & Docker Compose
- Node.js 18+, Python 3.11+
- OpenAI & Groq API keys

### Local Development
```bash
# Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start all services (Next.js, FastAPI, DB, Proxy)
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
# Health:   http://localhost:8000/health
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
    │   ├── ai_service.py    # OpenAI/Groq API
    │   ├── ai_cascade.py    # Fallback logic
    │   ├── websocket_manager.py  # WS connections
    │   ├── logger.py        # Structured logging
    │   └── routers/
    │       └── ws.py        # WebSocket routes
    └── requirements.txt     # Python dependencies
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

