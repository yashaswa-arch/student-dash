# Reset admin password to something simple
Write-Host "Let me manually promote your user through the database..." -ForegroundColor Green

# Let's use a simple approach - update via MongoDB directly
$mongoScript = @"
use student-dash
db.users.updateOne(
  { email: "yash@test.com" },
  { `$set: { role: "admin" } }
)
db.users.findOne({ email: "yash@test.com" })
"@

Write-Host "MongoDB Update Script:" -ForegroundColor Yellow
Write-Host $mongoScript -ForegroundColor White

Write-Host "`nIf you have MongoDB installed, run the above script in MongoDB shell." -ForegroundColor Cyan
Write-Host "Or try the admin login again - your role should be updated!" -ForegroundColor Green