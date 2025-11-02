# Test script for admin functionality

Write-Host "Testing Admin Setup and Authentication..." -ForegroundColor Green

# 1. Setup admin account
Write-Host "`n1. Setting up admin account..." -ForegroundColor Yellow
$adminSetupBody = @{
    username = "admin"
    email = "admin@studentdash.com"
    password = "Admin123!@#"
} | ConvertTo-Json

try {
    $setupResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/setup" -Method POST -Body $adminSetupBody -ContentType "application/json"
    Write-Host "✅ Admin setup successful:" -ForegroundColor Green
    Write-Host ($setupResponse | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Admin setup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test admin login
Write-Host "`n2. Testing admin login..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "admin@studentdash.com"
    password = "Admin123!@#"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
    Write-Host "✅ Admin login successful:" -ForegroundColor Green
    $adminToken = $loginResponse.token
    Write-Host "Token: $adminToken"
    Write-Host "User: $($loginResponse.user | ConvertTo-Json)"
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Test admin stats
Write-Host "`n3. Testing admin stats..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stats" -Method GET -Headers $headers
    Write-Host "✅ Admin stats retrieved:" -ForegroundColor Green
    Write-Host ($statsResponse | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Admin stats failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test get all users
Write-Host "`n4. Testing get all users..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" -Method GET -Headers $headers
    Write-Host "✅ Users retrieved:" -ForegroundColor Green
    Write-Host "Total users: $($usersResponse.total)"
    foreach ($user in $usersResponse.users) {
        Write-Host "- $($user.username) ($($user.email)) - Role: $($user.role)"
    }
} catch {
    Write-Host "❌ Get users failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test regular user login (should fail with admin endpoint)
Write-Host "`n5. Testing regular user with admin login (should fail)..." -ForegroundColor Yellow
$userLoginBody = @{
    email = "yash@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $userAdminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method POST -Body $userLoginBody -ContentType "application/json"
    Write-Host "❌ Regular user should not be able to login via admin route!" -ForegroundColor Red
} catch {
    Write-Host "✅ Regular user correctly denied admin access: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n🎉 Admin testing completed!" -ForegroundColor Green
Write-Host "`nAdmin Credentials:" -ForegroundColor Cyan
Write-Host "Email: admin@studentdash.com" -ForegroundColor White
Write-Host "Password: Admin123!@#" -ForegroundColor White