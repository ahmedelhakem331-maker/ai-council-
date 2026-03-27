# AI Council - System Architecture

## Overview

AI Council is a production-grade, multi-agent SaaS platform where specialized AI models collaborate in real-time to analyze, enhance, and critique user ideas. Built with modern technologies and enterprise-level resilience patterns.

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Next.js 14 Frontend (TypeScript, Tailwind, Framer Motion)   │ │
│  │  - Cinematic UI with agent boardroom visualization           │ │
│  │  - Real-time WebSocket streaming with recovery              │ │
│  │  - Optimistic UI + LocalStorage hybrid storage              │ │
│  │  - Error boundaries with state persistence                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                  │
                     (WebSocket + HTTP Routes)
                                  │
┌────────────────────────────────────────────────────────────────────┐
│                    REVERSE PROXY LAYER                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Caddy (HTTP/HTTPS, SSL termination, CORS)                  │ │
│  │  - Routes /ws/* to FastAPI                                   │ │
│  │  - Routes /api/* to FastAPI                                  │ │
│  │  - Routes /* to Next.js frontend                             │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                  │
┌────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  FastAPI Backend (Python 3.11)                              │ │
│  │                                                              │ │
│  │  WebSocket Manager                                           │ │
│  │  ├─ Connection tracking & heartbeat (ping/pong)             │ │
│  │  ├─ JWT token validation                                    │ │
│  │  └─ Cursor-based state recovery                             │ │
│  │                                                              │ │
│  │  AI Cascade Service                                          │ │
│  │  ├─ Primary: GPT-4o (5s timeout)                            │ │
│  │  ├─ Fallback 1: Groq-Llama-3-70B                            │ │
│  │  ├─ Fallback 2: GPT-3.5-turbo                               │ │
│  │  ├─ Circuit breaker pattern                                 │ │
│  │  └─ Exponential backoff retry logic                         │ │
│  │                                                              │ │
│  │  Streaming Handler                                           │ │
│  │  ├─ Token-by-token streaming with metadata                  │ │
│  │  ├─ Trace ID correlation across system                      │ │
│  │  ├─ Model metadata in stream packets                        │ │
│  │  └─ Structured JSON logging                                 │ │
│  │                                                              │ │
│  │  Quality Gate Service                                        │ │
│  │  ├─ LLM-as-a-Judge validation (1-5 score)                   │ │
│  │  ├─ Response quality verification                           │ │
│  │  └─ Background async job processing                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                  │
┌────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL (Neon.tech)                                      │ │
│  │                                                              │ │
│  │  Tables:                                                     │ │
│  │  ├─ users (multi-tenant, auth)                              │ │
│  │  ├─ sessions (boardroom sessions)                           │ │
│  │  ├─ messages (agent responses + embeddings)                 │ │
│  │  ├─ quality_gates (validation scores)                       │ │
│  │  ├─ audit_logs (compliance & observability)                 │ │
│  │  └─ agents (predefined AI models)                           │ │
│  │                                                              │ │
│  │  Indexes:                                                    │ │
│  │  ├─ Full-text search on message content                     │ │
│  │  ├─ pgvector for semantic search                            │ │
│  │  ├─ B-tree for session queries                              │ │
│  │  └─ BRIN for time-series audit logs                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

                            │
        (External Services)
            │
    ┌───────┼───────────────┐
    │       │               │
  OpenAI  Groq          Database
  GPT-4o  Llama-3      Backups
  GPT-3.5 Embedding    Snapshots
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4
- **Animation**: Framer Motion
- **Markdown**: react-markdown with syntax highlighting
- **State Management**: React hooks + Server Actions
- **Storage**: Hybrid (LocalStorage + Supabase)

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Async**: asyncio + anyio for structured concurrency
- **WebSocket**: Native FastAPI WebSockets with heartbeat
- **LLM Integration**: OpenAI SDK + Groq SDK
- **Database ORM**: Prisma (Python bindings)
- **Logging**: Structlog with JSON output
- **Security**: PyJWT, bcrypt

### Infrastructure
- **Database**: PostgreSQL 15 (Neon.tech for production)
- **Reverse Proxy**: Caddy (SSL, CORS, WebSocket)
- **Containerization**: Docker + Docker Compose
- **Environment**: Pydantic Settings

## Data Flow

### User Initiates Session
1. User enters idea in Next.js UI
2. Optimistic update to React state + LocalStorage
3. Frontend connects to WebSocket with JWT token

### Backend Processing
4. FastAPI WebSocket manager validates JWT
5. AI Cascade service starts with GPT-4o (primary)
6. Request gets unique trace_id (UUID v4)
7. Stream begins with message format:
   ```json
   {
     "type": "token",
     "content": "chunk...",
     "agent": {"id": "nova", "name": "Nova", "color": "cyan"},
     "trace_id": "uuid-xxx",
     "meta": {"model": "gpt-4o", "recovery": false, "index": 42}
   }
   ```

### Error Handling
8. If GPT-4o times out after 5s or fails:
   - Circuit breaker opens
   - Instant fallback to Groq-Llama-3
   - Recovery event sent to frontend:
     ```json
     {
       "type": "recovery_start",
       "from": "gpt-4o",
       "to": "groq-llama3",
       "reason": "timeout",
       "cursor": 42
     }
     ```
9. Stream continues seamlessly with Groq
10. Text continues beyond cursor without duplication

### UI Rendering
11. Frontend receives tokens
12. Sentence-by-sentence reveal (50ms stagger)
13. Active agent pulses with focal glow
14. Inactive agents dimmed to 0.7 opacity
15. Recovery indicator shows "⚡ Recovering with backup AI..."

### Persistence
16. On stream completion, debounced auto-save triggers
17. Frontend sends: `POST /api/messages` with trace_id
18. Backend persists to PostgreSQL
19. Quality Gate background job evaluates response (async)
20. Quality score stored in database

### Admin Monitoring
21. Admin dashboard queries `/admin/logs`
22. Real-time trace_id, tokens, latency, model, quality visible
23. Metrics aggregated per agent
24. Fallback rate tracked per model

## Key Features

### Real-time Streaming
- **Token Buffering**: 50ms batch size for smooth UI
- **Auto-scroll**: Only scrolls if user near bottom
- **Markdown Rendering**: Code blocks lazy-loaded
- **Model Metadata**: Every chunk includes model identity

### Resilience
- **5-Second Timeout**: Hard cutoff for primary model
- **Instant Switchover**: Zero-delay fallback activation
- **Cursor Resume**: Mid-stream interruption recovery
- **Exponential Backoff**: Up to 5 retries (1s, 2s, 4s, 8s, 16s)
- **Circuit Breaker**: Opens after 5 failures, recovers after 30s

### UI/UX
- **Cinematic Design**: Glassmorphism + neon glows
- **Agent Boardroom**: 2x2 grid with focal point animations
- **Smooth Animations**: Framer Motion with reduced-motion support
- **Dark Theme**: WCAG AA compliant contrast
- **RTL Support**: Full Arabic language support

### Observability
- **Structured Logging**: JSON-formatted with trace_id
- **Performance Metrics**: Token count, latency_ms, model_used
- **Error Tracking**: Last known state on crashes
- **Quality Scoring**: LLM-as-a-Judge validation (1-5)
- **Admin Dashboard**: Real-time performance monitoring

### Database
- **Multi-tenant**: Row-level security (RLS)
- **Full-text Search**: PostgreSQL tsvector + pgvector
- **Cursor Pagination**: Efficient retrieval of large histories
- **Deduplication**: clientId ensures no duplicate messages
- **Audit Trail**: Complete activity logging

## Deployment

### Development
```bash
docker-compose up -d
```
Runs all services locally with hot reloads.

### Production
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Railway/Render (FastAPI)
- **Database**: Neon.tech (serverless PostgreSQL)
- **Proxy**: Caddy on production domain
- **SSL**: Auto-managed by Caddy

## Security

- **JWT Authentication**: All WebSocket connections validated
- **CORS**: Configurable per environment
- **Rate Limiting**: Per-user connection limits (max 3)
- **Input Validation**: Pydantic schemas for all inputs
- **SQL Injection Prevention**: Prisma parameterized queries
- **Environment Secrets**: Never committed, Vercel/Railway managed

## Performance Targets

| Metric | Target |
|--------|--------|
| WebSocket Connect | < 100ms |
| First Token Latency | < 800ms |
| Token Streaming | 40-100ms per chunk |
| Fallback Switch | < 50ms |
| UI Update | < 16ms (60fps) |
| Admin Dashboard Query | < 100ms |
| Sentence Reveal Animation | Smooth 50ms stagger |

## Monitoring & Alerts

- **Uptime**: UptimeRobot for 99.9% SLA
- **Errors**: Sentry integration for crash tracking
- **Logs**: Structured logs shipped to Datadog/LogRocket
- **Metrics**: Prometheus endpoints for custom dashboards
- **Quality**: Daily quality score aggregations
