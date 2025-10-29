# Simple Authentication Test
Write-Host "Testing Authentication System..." -ForegroundColor Green

# Test login with valid credentials
$loginData = '{"email":"alice.smith@example.com","password":"Student123!"}'

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "SUCCESS: Login works!" -ForegroundColor Green
        Write-Host "User: $($result.data.user.name)" -ForegroundColor Cyan
        Write-Host "Role: $($result.data.user.role)" -ForegroundColor Cyan
        Write-Host "Token received: $($result.data.token.Substring(0,20))..." -ForegroundColor Cyan
    } else {
        Write-Host "FAILED: Login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed!" -ForegroundColor Green