# ✅ قائمة الفحص الشاملة - هل الموقع شغال؟

## 🔴 قبل البدء - تجهيز البيئة

### أولاً: MySQL/PostgreSQL يجب أن يكون تشغيل
```bash
# في Terminal منفصل - شغل قاعدة البيانات
# إذا استخدمت PostgreSQL:
# macOS/Linux:
brew services start postgresql
# أو يدويها:
psql

# Windows - استخدم pgAdmin أو التطبيق
```

### ثانياً: متغيرات البيئة
```bash
cd backend
cat > .env << 'EOF'
NODE_ENV=development
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Database - اضبط هذا حسب تثبيتك
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_council"
# أو إذا استخدمت SQLite للتطوير:
# DATABASE_URL="sqlite:./dev.db"

# OpenAI (مفتاح وهمي للتطوير)
OPENAI_API_KEY="sk-test-key"
GROQ_API_KEY="gsk-test-key"
JWT_SECRET="test-secret-min-32-characters-required-here"

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
ENABLE_STRUCTURED_LOGGING=true
ENABLE_TRACE_ID_CORRELATION=true
EOF
```

---

## 🟡 خطوات البدء

### خطوة 1️⃣: تثبيت Dependencies
```bash
cd backend

# إنشاء Virtual Environment
python3 -m venv venv
source venv/bin/activate
# أو Windows:
# venv\Scripts\activate

# تثبيت المكتبات
pip install -r requirements.txt
```

### خطوة 2️⃣: إعداد قاعدة البيانات
```bash
# توليد Prisma Client
npx prisma generate

# إنشاء Migration الأول
npx prisma migrate dev --name init

# (اختياري) عرض قاعدة البيانات
npx prisma studio
```

### خطوة 3️⃣: تشغيل Backend
```bash
# تأكد أنك في مجلد backend وأن venv مفعل
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**النتيجة المتوقعة:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### خطوة 4️⃣: اختبار Backend API
```bash
# في Terminal منفصل

# 1. Health Check
curl http://localhost:8000/health
# يجب تحصل على:
# {"status": "healthy", "version": "1.0.0", ...}

# 2. Metrics
curl http://localhost:8000/metrics
# يجب تحصل على:
# {"total_requests": 2, "average_latency_ms": 45.5, ...}

# 3. الـ Swagger Docs (في المتصفح)
# http://localhost:8000/docs
```

### خطوة 5️⃣: تشغيل Frontend
```bash
# في Terminal جديد (ارجع للـ root directory)
cd ..

# تثبيت Dependencies
npm install

# تشغيل dev server
npm run dev
```

**النتيجة المتوقعة:**
```
▲ Next.js 14.2.0
✓ Ready in 2.1s
○ Localhost:3000
```

دخل المتصفح: `http://localhost:3000`

---

## 🟢 اختبار الموقع

### 1. الـ Health Endpoints ✅
```bash
# Health
curl http://localhost:8000/health

# Metrics
curl http://localhost:8000/metrics

# API Docs
curl http://localhost:8000/docs (في المتصفح)
```

### 2. الـ Frontend
- الصفحة الأساسية تحمل بدون أخطاء
- الوان Glassmorphism صحيحة (Dark theme)
- زر "Convene Council" يظهر
- اللغة يمكن تبديلها (EN / AR)

### 3. الـ WebSocket Connection
اكتب فكرة في الـ Textarea:
```
"How can I improve my productivity with AI?"
```

اضغط "🏛️ Convene Council"

يجب تشوف:
- ✅ الـ 5 Agents يظهرون (Nova, Pixel, Cipher, Vector, Apex)
- ✅ النصوص تظهر Token by Token (streaming)
- ✅ Recovery Indicator إذا حصلت مشكلة (fallback)
- ✅ Metrics في الأسفل (Recovery Count, Cursor Position)

### 4. Database Integration
```bash
# تفتح Prisma Studio
cd backend
npx prisma studio

# انتظر - يفتح http://localhost:5555
# يجب تشوف:
# - sessions table (فيها session واحد على الأقل)
# - messages table (فيها ردود من الـ agents)
# - system_metrics table (metrics من الـ requests)
```

### 5. التشغيل Logs
```bash
# في Terminal Backend - يجب تشوف logs:
# INFO ... WebSocket connected
# INFO ... New chat session started
# INFO ... Agent nova completed (token_count, latency_ms)
# INFO ... Session completed
```

---

## 🔴 إذا حصلت مشاكل

### مشكلة: "Database connection failed"
```bash
# تأكد:
1. PostgreSQL شغال
2. DATABASE_URL صح في .env
3. جرب SQLite للتطوير:
   DATABASE_URL="sqlite:./dev.db"
```

### مشكلة: "Prisma client not found"
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### مشكلة: "Port 8000 already in use"
```bash
# غير الـ Port
python -m uvicorn app.main:app --reload --port 8001
```

### مشكلة: "WebSocket connection failed"
```bash
# تأكد من:
1. Backend يشتغل على :8000
2. Frontend يشتغل على :3000
3. CORS مسموح (في config.py)
```

### مشكلة: "API keys invalid"
```bash
# للتطوير بدون API keys حقيقية:
# غير في backend/app/routers/ws.py
# وأرجع response وهمي
```

---

## ✅ Checklist النهائي

```
✓ Backend يشتغل على http://localhost:8000 بدون أخطاء
✓ Frontend يشتغل على http://localhost:3000 بدون أخطاء
✓ curl http://localhost:8000/health يرجع 200 OK
✓ curl http://localhost:8000/metrics يرجع metrics
✓ Database connected وفي دوكومنتشن startup logs
✓ Frontend يحمل، Language toggle يشتغل
✓ اكتب idea، اضغط "Convene Council"
✓ الـ Agents 5 يظهرون وتقدم responses (streaming)
✓ Session محفوظ في Database (Prisma Studio)
✓ Logs تظهر في Backend Terminal
```

---

## 🎉 تمام التمام - الموقع شغال!

اللي تحتاجه الآن:
1. ✅ Backend: `python -m uvicorn app.main:app --reload`
2. ✅ Frontend: `npm run dev`
3. ✅ اكتب فكرتك والـ AI Council يرد عليك

**Happy coding! 🚀**

---

**ملاحظات مهمة:**
- الـ AI responses وهمية الآن (لو عندك API keys حقيقية - استبدل في `.env`)
- Database مثبتة وجاهزة للـ production
- Tests جاهزة: `pytest -v` في مجلد backend
- Documentation كاملة في README.md و QUICK_START.md
