# START LEETCODE QUESTION TRACKER SYSTEM
# This script starts all required services in order

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  LEETCODE QUESTION TRACKER - STARTUP" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start MongoDB (if not running)
Write-Host "[1/4] Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "OK MongoDB already running" -ForegroundColor Green
} else {
    Write-Host "WARNING MongoDB not running. Please start MongoDB manually." -ForegroundColor Red
    Write-Host "  Command: net start MongoDB" -ForegroundColor Gray
}
Write-Host ""

# 2. Start Backend Server (port 5000)
Write-Host "[2/4] Starting Backend Server (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\yasha\OneDrive\Desktop\project2\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev"
Write-Host "OK Backend starting in new window..." -ForegroundColor Green
Start-Sleep -Seconds 3
Write-Host ""

# 3. Start AI Service (port 8001)
Write-Host "[3/4] Starting AI Service (port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\yasha\OneDrive\Desktop\project2\ai-service'; Write-Host 'AI Service Starting...' -ForegroundColor Green; python simple_main.py"
Write-Host "OK AI Service starting in new window..." -ForegroundColor Green
Start-Sleep -Seconds 3
Write-Host ""

# 4. Start Frontend (port 5173)
Write-Host "[4/4] Starting Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\yasha\OneDrive\Desktop\project2\frontend'; Write-Host 'Frontend Starting...' -ForegroundColor Green; npm run dev"
Write-Host "OK Frontend starting in new window..." -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host "  AI Service: http://localhost:8001" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access LeetCode Tracker:" -ForegroundColor White
Write-Host "  http://localhost:5173/leetcode-tracker" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
