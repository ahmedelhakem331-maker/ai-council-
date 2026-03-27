# AI Council - Deployment Guide

## Quick Start (Development)

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ and npm
- Python 3.11+
- OpenAI API key
- Groq API key (optional)

### Local Development Setup

1. **Clone and Setup**
   ```bash
   cd chrono-triangulum
   cp .env.example .env.local
   ```

2. **Configure Environment Variables**
   Edit `.env.local` with your API keys:
   ```env
   OPENAI_API_KEY=sk_test_xxx
   GROQ_API_KEY=gsk_xxx
   JWT_SECRET=your_secret_min_32_chars
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

5. **Start Everything with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - Next.js frontend on http://localhost:3000
   - FastAPI backend on http://localhost:8000
   - PostgreSQL database on localhost:5432
   - Caddy reverse proxy on http://localhost

6. **Check Health**
   ```bash
   curl http://localhost:8000/health
   ```

7. **Test WebSocket Connection**
   Open browser to http://localhost:3000 and use the UI to start a council session.

### Stopping Services
```bash
docker-compose down
```

---

## Production Deployment

### Architecture
For production, deploy components separately:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway/Render (FastAPI)
- **Database**: Neon.tech (PostgreSQL)
- **Proxy**: Caddy on your domain

### 1. Database Setup (Neon.tech)

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in backend environment variables

### 2. Backend Deployment (Railway)

1. Connect GitHub repository to Railway
2. Create new service from Dockerfile:
   ```
   Railway → New Project → Deploy from GitHub
   ```
3. Set environment variables in Railway dashboard:
   ```
   OPENAI_API_KEY=sk_xxx
   GROQ_API_KEY=gsk_xxx
   JWT_SECRET=xxxxx
   DATABASE_URL=postgresql://user:pass@host/db
   NODE_ENV=production
   ```
4. Deploy (Railway auto-builds and deploys)

### 3. Frontend Deployment (Vercel)

1. Push main branch to GitHub
2. Connect repository to Vercel:
   ```
   https://vercel.com/new
   ```
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
   ```
4. Deploy (Vercel auto-builds on push)

### 4. DNS & SSL

1. Point domain to your Caddy instance or Vercel nameservers
2. Caddy auto-renews SSL certificates

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
NEXT_PUBLIC_APP_NAME=AI Council
```

### Backend (.env)
```env
# LLM Configuration
OPENAI_API_KEY=sk_xxx
GROQ_API_KEY=gsk_xxx
JWT_SECRET=xxxxx
DATABASE_URL=postgresql://...

# Application
NODE_ENV=production
LOG_LEVEL=INFO

# WebSocket
WEBSOCKET_HEARTBEAT_INTERVAL=30
MAX_CONNECTIONS_PER_USER=3

# Quality Gate
ENABLE_LLM_JUDGE=true
QUALITY_GATE_THRESHOLD=3.0
```

---

## Monitoring & Logs

### View Logs (Docker Compose)
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f db
```

### Access Admin Dashboard
```
http://localhost:8000/admin/logs
```

### Health Check Endpoint
```bash
curl http://localhost:8000/health
```

---

## Troubleshooting

### WebSocket Connection Fails
- Check browser console for errors
- Verify CORS origins in backend config
- Ensure firewall allows WebSocket (port 8000)

### API Key Errors
- Verify keys are in `.env` file (not committed)
- Check API key validity on OpenAI/Groq dashboards
- Confirm keys have required permissions

### Database Connection Issues
- For local: Ensure PostgreSQL container is running (`docker ps`)
- For production (Neon): Verify connection string includes `?sslmode=require`
- Check database pool settings in config

### High Memory Usage
- Reduce batch size in WebSocket token streaming
- Lower `DATABASE_POOL_MAX` in config
- Monitor connection count: `GET /stats`

---

## Performance Optimization

### Frontend
- Enable Vercel edge caching
- Use Code Splitting for bundle optimization
- Monitor Core Web Vitals in Vercel Analytics

### Backend
- Use Redis for rate limiting (optional)
- Enable Gzip compression in Caddy
- Monitor OpenAI API usage for cost

### Database
- Regular Neon snapshots for backups
- Monitor query performance with `pg_stat_statements`
- Use connection pooling (PgBouncer if needed)

---

## Security Checklist

- [ ] JWT_SECRET is 32+ characters and unique
- [ ] API keys not committed to git (.gitignore working)
- [ ] CORS origins restricted to your domains
- [ ] HTTPS/SSL enabled on all endpoints
- [ ] Rate limiting configured for WebSocket
- [ ] Database IP whitelist configured (Neon)
- [ ] Admin dashboard password changed from default
- [ ] Sentry or similar error tracking enabled
- [ ] Regular backups configured (Neon snapshots)
- [ ] Monitoring alerts set up for errors/downtime

---

## Scaling Considerations

- **Horizontal**: Run multiple backend instances behind load balancer
- **Vertical**: Increase server resources for higher throughput
- **Database**: Use Neon Autoscaling for variable workloads
- **Cache**: Add Redis for session and response caching
- **CDN**: Put frontend behind Cloudflare/CloudFront

---

## Support & Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- Next.js Docs: https://nextjs.org/docs
- Neon.tech Docs: https://neon.tech/docs
- Railway Docs: https://railway.app/docs
- Vercel Docs: https://vercel.com/docs
