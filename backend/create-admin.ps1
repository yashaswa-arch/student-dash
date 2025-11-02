# Promote existing user to admin
Write-Host "Making existing user an admin..." -ForegroundColor Green

# First, let's create a proper admin account
$adminBody = @{
    username = "admin"
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Creating admin account..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/setup" -Method POST -Body $adminBody -ContentType "application/json"
    Write-Host "✅ Admin account created!" -ForegroundColor Green
    Write-Host "Email: admin@example.com" -ForegroundColor Cyan
    Write-Host "Password: admin123" -ForegroundColor Cyan
    
    # Test the login
    Write-Host "`nTesting admin login..." -ForegroundColor Yellow
    $loginBody = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Admin login test successful!" -ForegroundColor Green
    Write-Host "Admin user: $($loginResponse.user.username)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try the login anyway in case account exists
    Write-Host "`nTrying to login with existing credentials..." -ForegroundColor Yellow
    try {
        $loginBody = @{
            email = "admin@example.com"
            password = "admin123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method POST -Body $loginBody -ContentType "application/json"
        Write-Host "✅ Login successful with existing account!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Login also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}