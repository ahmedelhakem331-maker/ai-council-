# 🚀 تشغيل AI Council من الصفر - 3 خطوات

## ✅ 1️⃣ الإعداد الأولي (5 دقائق)

```bash
# استنساخ المشروع
git clone <repo>
cd chrono-triangulum

# تثبيت الـ Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# إعداد قاعدة البيانات
npx prisma generate
npx prisma migrate dev --name init  # اختر اسماً للـ migration (مثل "init")

# إنشاء ملف .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/ai_council"
OPENAI_API_KEY="sk-..."
GROQ_API_KEY="gsk_..."
JWT_SECRET="your-secret-key-min-32-characters"
NODE_ENV="development"
EOF
```

## ✅ 2️⃣ تشغيل Backend (في Terminal 1)

```bash
cd backend
python -m uvicorn app.main:app --reload
```

✨ **النتيجة:**
```
✓ Database connected
✓ Server running at http://localhost:8000
✓ API Docs: http://localhost:8000/docs
```

## ✅ 3️⃣ تشغيل Frontend (في Terminal 2)

```bash
cd ..  # العودة للـ root
npm install
npm run dev
```

✨ **النتيجة:**
- الـ Frontend متاح على `http://localhost:3000`
- اكتب فكرتك والمجلس الـ AI يرد عليك ✨

---

## 🔗 التحقق من كل شيء

**Endpoints:**
- 🏥 Health Check: `curl http://localhost:8000/health`
- 📊 Metrics: `curl http://localhost:8000/metrics`
- 💬 WebSocket: `ws://localhost:8000/api/v1/ws/chat`
- 📚 API Docs: http://localhost:8000/docs

**Database:**
- الـ Sessions تُحفظ تلقائياً في جدول `sessions`
- الـ Responses تُحفظ في جدول `messages`
- الـ Metrics تُحفظ في جدول `system_metrics`

---

## 🆘 في حالة مشاكل

```bash
# تشغيل الاختبارات
cd backend
pytest -v

# إعادة تعيين قاعدة البيانات (تحذير: يمسح جميع البيانات)
npx prisma migrate reset

# تحقق من متغيرات البيئة
cat .env
```

**مبروك! 🎉 المشروع جاهز للعمل!**
