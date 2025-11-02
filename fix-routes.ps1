# Fix questionRoutes.js - replace protect with auth
$file = "backend\src\routes\questionRoutes.js"
$content = Get-Content $file -Raw
$content = $content -replace 'protect', 'auth'
$content | Set-Content $file -NoNewline
Write-Host "Fixed questionRoutes.js - replaced 'protect' with 'auth'"
