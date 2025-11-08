# Test the honest analyzer with brute force Two Sum code

$body = @{
    code = @"
def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
"@
    language = "python"
    problemTitle = "Two Sum"
    problemDescription = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
} | ConvertTo-Json

Write-Host "`n🧪 Testing Honest Analyzer with Brute Force Two Sum..." -ForegroundColor Cyan
Write-Host "Code: Nested loops O(n²) solution`n" -ForegroundColor Yellow

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
    
    Write-Host "`nMissing Edge Cases:" -ForegroundColor Yellow
    $response.missingEdgeCases | ForEach-Object { Write-Host "  $_" }
    
    Write-Host "`nImprovements:" -ForegroundColor Blue
    $response.improvements | ForEach-Object { Write-Host "  $_" }
    
    if ($response.bruteToOptimalSuggestions -and $response.bruteToOptimalSuggestions.Count -gt 0) {
        Write-Host "`nOptimization Path:" -ForegroundColor Magenta
        $response.bruteToOptimalSuggestions | ForEach-Object { Write-Host "  $_" }
    }
    
    Write-Host "`nHint: $($response.hint)" -ForegroundColor Yellow
    
    if ($response.score) {
        Write-Host "`nScore:" -ForegroundColor Green
        Write-Host "  Correctness: $($response.score.correctness)/40"
        Write-Host "  Efficiency: $($response.score.efficiency)/30"
        Write-Host "  Code Quality: $($response.score.codeQuality)/30"
        Write-Host "  Overall: $($response.score.overall)/100"
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response
}

Write-Host "`n================================`n" -ForegroundColor Cyan
