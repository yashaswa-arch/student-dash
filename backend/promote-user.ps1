# Promote user to admin role
Write-Host "Promoting user to admin..." -ForegroundColor Green

$promoteBody = @{
    email = "yash@test.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/dev/promote-to-admin" -Method POST -Body $promoteBody -ContentType "application/json"
    Write-Host "✅ User promoted to admin!" -ForegroundColor Green
    Write-Host "Username: $($response.user.username)" -ForegroundColor Cyan
    Write-Host "Email: $($response.user.email)" -ForegroundColor Cyan
    Write-Host "Role: $($response.user.role)" -ForegroundColor Cyan
    Write-Host "`nNow try admin login with:" -ForegroundColor Yellow
    Write-Host "Email: yash@test.com" -ForegroundColor White
    Write-Host "Password: password123" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "The dev route might not be loaded. Restart the backend and try again." -ForegroundColor Yellow
}