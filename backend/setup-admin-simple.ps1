# Admin Setup Script
Write-Host "Setting up admin account..." -ForegroundColor Green

$adminData = @{
    username = "admin"
    email = "admin@studentdash.com" 
    password = "Admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/setup" -Method POST -Body $adminData -ContentType "application/json"
    Write-Host "Admin account created successfully!" -ForegroundColor Green
    Write-Host "Email: admin@studentdash.com" -ForegroundColor Cyan
    Write-Host "Password: Admin123" -ForegroundColor Cyan
} catch {
    Write-Host "Error or admin already exists: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Try login with: admin@studentdash.com / Admin123" -ForegroundColor Cyan
}