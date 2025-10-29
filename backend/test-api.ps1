# Test API endpoints
Write-Host "Testing Code Execution API..." -ForegroundColor Green

# Test 1: Get supported languages
Write-Host "`n1. Testing GET /api/code-execution/languages" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/code-execution/languages" -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Quick run JavaScript code
Write-Host "`n2. Testing POST /api/code-execution/quick-run (JavaScript)" -ForegroundColor Yellow
$jsCode = @{
    code = "console.log('Hello, World!');"
    language = "javascript"
    input = ""
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/code-execution/quick-run" -Method POST -Body $jsCode -ContentType "application/json"
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Quick run Python code
Write-Host "`n3. Testing POST /api/code-execution/quick-run (Python)" -ForegroundColor Yellow
$pythonCode = @{
    code = "print('Hello from Python!')"
    language = "python"
    input = ""
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/code-execution/quick-run" -Method POST -Body $pythonCode -ContentType "application/json"
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Green