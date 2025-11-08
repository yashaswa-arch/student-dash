# Test with EMPTY code

$body = @{
    code = ""
    language = "python"
    problemTitle = "Two Sum"
    problemDescription = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
} | ConvertTo-Json

Write-Host "`n🧪 Test 2: Empty Code (Rule 1)" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/leetcode/analyze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Response received!`n" -ForegroundColor Green
    
    Write-Host "Time Complexity: $($response.timeComplexity)" -ForegroundColor Cyan
    Write-Host "Space Complexity: $($response.spaceComplexity)" -ForegroundColor Cyan
    
    Write-Host "`nMistakes:" -ForegroundColor Red
    $response.mistakes | ForEach-Object { Write-Host "  $_" }
    
    Write-Host "`nHint: $($response.hint)" -ForegroundColor Yellow
    
    if ($response.score) {
        Write-Host "`nScore: $($response.score.overall)/100" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================`n" -ForegroundColor Cyan
