# PowerShell script to start all services for the Student Dashboard

Write-Host "🚀 Starting Student Dashboard Services..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "ai-service\simple_main.py")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "1️⃣ Starting AI Service (Port 8001)..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD\ai-service'; python simple_main.py"

Start-Sleep -Seconds 3

Write-Host "2️⃣ Starting Backend Service (Port 5000)..." -ForegroundColor Cyan  
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start"

Start-Sleep -Seconds 5

Write-Host "3️⃣ Starting Frontend Service (Port 3000)..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"

Write-Host "✅ All services starting..." -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "⚙️  Backend: http://localhost:5000" -ForegroundColor Yellow  
Write-Host "🤖 AI Service: http://localhost:8001" -ForegroundColor Yellow

Write-Host "`nPress any key to close this window..."
Read-Host