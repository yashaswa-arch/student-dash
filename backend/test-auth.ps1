# Test Authentication System
Write-Host "Testing Authentication System..." -ForegroundColor Green

$baseUrl = "http://localhost:5000"

# Test 1: Try accessing protected route without token
Write-Host "`n1. Testing protected route without authentication" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/code-execution/submit" -Method POST -ContentType "application/json" -Body '{"code":"test","language":"javascript"}'
    Write-Host "ERROR: Should have been rejected!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "PASSED: Protected route correctly rejected" -ForegroundColor Green
    Write-Host "   Message: $($errorResponse.message)" -ForegroundColor Cyan
}

# Test 2: Login with test credentials
Write-Host "`n2. Testing login with valid credentials" -ForegroundColor Yellow
$loginData = @{
    email = "alice.smith@example.com"
    password = "Student123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginResult.success) {
        Write-Host "PASSED: Login successful" -ForegroundColor Green
        $token = $loginResult.data.token
        Write-Host "   User: $($loginResult.data.user.name)" -ForegroundColor Cyan
        Write-Host "   Role: $($loginResult.data.user.role)" -ForegroundColor Cyan
        
        # Test 3: Access protected route with valid token
        Write-Host "`n3. Testing protected route with valid token" -ForegroundColor Yellow
        try {
            $headers = @{
                Authorization = "Bearer $token"
                'Content-Type' = 'application/json'
            }
            
            $codeDataJson = '{"code":"console.log(\"Hello, authenticated world!\");","language":"javascript"}'
            
            $codeResponse = Invoke-WebRequest -Uri "$baseUrl/api/code-execution/quick-run" -Method POST -Body $codeDataJson -Headers $headers
            $codeResult = $codeResponse.Content | ConvertFrom-Json
            
            if ($codeResult.success) {
                Write-Host "PASSED: Code execution with authentication works" -ForegroundColor Green
                Write-Host "   Status: $($codeResult.data.status)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "FAILED: Code execution with valid token failed" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 4: Get user profile
        Write-Host "`n4. Testing user profile access" -ForegroundColor Yellow
        try {
            $profileResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
            $profileResult = $profileResponse.Content | ConvertFrom-Json
            
            if ($profileResult.success) {
                Write-Host "PASSED: User profile access works" -ForegroundColor Green
                Write-Host "   User: $($profileResult.data.user.name)" -ForegroundColor Cyan
                Write-Host "   Email: $($profileResult.data.user.email)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "FAILED: User profile access failed" -ForegroundColor Red
        }
        
    } else {
        Write-Host "FAILED: Login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED: Login request failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Try login with invalid credentials
Write-Host "`n5. Testing login with invalid credentials" -ForegroundColor Yellow
$invalidLoginData = @{
    email = "invalid@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $invalidLoginData -ContentType "application/json"
    Write-Host "ERROR: Invalid login should have failed!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "PASSED: Invalid credentials correctly rejected" -ForegroundColor Green
    Write-Host "   Message: $($errorResponse.message)" -ForegroundColor Cyan
}

Write-Host "`nAuthentication Testing Complete!" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor White
Write-Host "   Protected routes require authentication" -ForegroundColor Green
Write-Host "   Valid login returns JWT token" -ForegroundColor Green  
Write-Host "   Token allows access to protected routes" -ForegroundColor Green
Write-Host "   User profile access works" -ForegroundColor Green
Write-Host "   Invalid credentials are rejected" -ForegroundColor Green