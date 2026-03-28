# ============================================
# AI COUNCIL - AUTOMATIC STARTUP SCRIPT
# ============================================

Write-Host "🚀 Starting AI Council Backend..." -ForegroundColor Cyan

# Change to backend directory
Set-Location "C:\Users\Ahmed Elmogamer\.gemini\antigravity\playground\chrono-triangulum\backend"

# ============================================
# Step 1: Check Python
# ============================================
Write-Host "`n📦 Checking Python..." -ForegroundColor Yellow
$pythonCheck = python --version 2>&1

if ($pythonCheck -like "*not recognized*") {
    Write-Host "⚠️  Python not found. Installing..." -ForegroundColor Red

    # Try to install Python using winget (modern Windows)
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Installing Python 3.11..." -ForegroundColor Yellow
        winget install Python.Python.3.11 -y --silent
        Write-Host "✅ Python installed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Python must be installed manually from https://www.python.org/downloads/" -ForegroundColor Red
        Read-Host "Press Enter after installing Python"
    }
}
else {
    Write-Host "✅ Python found: $pythonCheck" -ForegroundColor Green
}

# ============================================
# Step 2: Create Virtual Environment
# ============================================
Write-Host "`n🔧 Creating Virtual Environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}
else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# ============================================
# Step 3: Activate Virtual Environment
# ============================================
Write-Host "`n⚡ Activating Virtual Environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# ============================================
# Step 4: Install Dependencies
# ============================================
Write-Host "`n📥 Installing Dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# ============================================
# Step 5: Create .env file
# ============================================
Write-Host "`n📝 Setting up .env file..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    @"
NODE_ENV=development
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Database (SQLite for development)
DATABASE_URL="sqlite:./dev.db"

# OpenAI
OPENAI_API_KEY=sk-test-key-development
OPENAI_MODEL_PRIMARY=gpt-4o
OPENAI_TIMEOUT_SECONDS=5

# Groq (Fallback)
GROQ_API_KEY=gsk-test-key-development
GROQ_MODEL=llama-3-70b-versatile

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_required_here_dev

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
ENABLE_STRUCTURED_LOGGING=true
ENABLE_TRACE_ID_CORRELATION=true
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
}
else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# ============================================
# Step 6: Generate Prisma Client
# ============================================
Write-Host "`n🗄️  Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate --quiet 2>&1 | Out-Null
Write-Host "✅ Prisma client generated" -ForegroundColor Green

# ============================================
# Step 7: Run Prisma Migration
# ============================================
Write-Host "`n🔄 Running Database Migration..." -ForegroundColor Yellow
npx prisma migrate deploy --skip-generate 2>&1 | Out-Null
Write-Host "✅ Database migrated" -ForegroundColor Green

# ============================================
# Step 8: Start Backend Server
# ============================================
Write-Host "`n🎯 Starting FastAPI Server..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "Server starting on: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Health: http://localhost:8000/health" -ForegroundColor Green
Write-Host "Metrics: http://localhost:8000/metrics" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
