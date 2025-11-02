# Debug script to check users
Write-Host "Checking existing users..." -ForegroundColor Green

# Try to login as regular user first to test if auth works at all
$userBody = '{"email":"yash@test.com","password":"password123"}'
try {
    $userResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $userBody -ContentType "application/json"
    Write-Host "Regular user login works!" -ForegroundColor Green
    Write-Host "User: $($userResponse.user.username) - Role: $($userResponse.user.role)"
} catch {
    Write-Host "Regular user login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Now try admin with simple password
Write-Host "`nTrying admin login..." -ForegroundColor Yellow
$adminBody = '{"email":"admin@studentdash.com","password":"Admin123"}'
try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method POST -Body $adminBody -ContentType "application/json"
    Write-Host "Admin login successful!" -ForegroundColor Green
    Write-Host "Admin: $($adminResponse.user.username) - Role: $($adminResponse.user.role)"
} catch {
    Write-Host "Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Try admin with complex password
Write-Host "`nTrying admin with complex password..." -ForegroundColor Yellow
$adminComplexBody = '{"email":"admin@studentdash.com","password":"Admin123!@#"}'
try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method POST -Body $adminComplexBody -ContentType "application/json"
    Write-Host "Admin login successful!" -ForegroundColor Green
    Write-Host "Admin: $($adminResponse.user.username) - Role: $($adminResponse.user.role)"
} catch {
    Write-Host "Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
}