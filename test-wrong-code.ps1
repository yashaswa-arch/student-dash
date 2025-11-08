# Test with WRONG Java code for add two numbers

$body = @{
    code = @"
public class Solution {
    public int addTwoNumbers(int a, int b) {
        return a - b;  // WRONG! Should be a + b
    }
}
"@
    language = "java"
    problemTitle = "Add Two Numbers"
    problemDescription = "Write a function that adds two integers and returns the sum."
} | ConvertTo-Json

Write-Host "`n🧪 Testing with WRONG Java Code (a - b instead of a + b)..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/leetcode/analyze" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "`n✅ Response received!`n" -ForegroundColor Green
    
    Write-Host "Time Complexity: $($response.timeComplexity)" -ForegroundColor Cyan
    Write-Host "Space Complexity: $($response.spaceComplexity)" -ForegroundColor Cyan
    
    Write-Host "`nMistakes:" -ForegroundColor Red
    $response.mistakes | ForEach-Object { Write-Host "  $_" }
    
    Write-Host "`nMissing Edge Cases:" -ForegroundColor Yellow
    $response.missingEdgeCases | ForEach-Object { Write-Host "  $_" }
    
    Write-Host "`nImprovements:" -ForegroundColor Blue
    $response.improvements | ForEach-Object { Write-Host "  $_" }
    
    Write-Host "`nHint: $($response.hint)" -ForegroundColor Yellow
    
    if ($response.score) {
        Write-Host "`nScore:" -ForegroundColor Green
        Write-Host "  Correctness: $($response.score.correctness)/40"
        Write-Host "  Efficiency: $($response.score.efficiency)/30"
        Write-Host "  Code Quality: $($response.score.codeQuality)/30"
        Write-Host "  Overall: $($response.score.overall)/100"
    }
    
    Write-Host "`n=== FULL RESPONSE JSON ===" -ForegroundColor Magenta
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================`n" -ForegroundColor Cyan
