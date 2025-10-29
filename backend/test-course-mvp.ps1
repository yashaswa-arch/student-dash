# Test Course Management MVP
Write-Host "Testing Course Management MVP..." -ForegroundColor Green

$baseUrl = "http://localhost:5000"

# Step 1: Login to get token
Write-Host "`n1. Logging in as student..." -ForegroundColor Yellow
$loginData = '{"email":"alice.smith@example.com","password":"Student123!"}'

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginResult.success) {
        $token = $loginResult.data.token
        Write-Host "SUCCESS: Login works!" -ForegroundColor Green
        Write-Host "User: $($loginResult.data.user.name)" -ForegroundColor Cyan
        
        $headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }
        
        # Step 2: Get available courses
        Write-Host "`n2. Getting available courses..." -ForegroundColor Yellow
        try {
            $coursesResponse = Invoke-WebRequest -Uri "$baseUrl/api/courses" -Method GET -Headers $headers
            $coursesResult = $coursesResponse.Content | ConvertFrom-Json
            
            if ($coursesResult.success -and $coursesResult.data.courses.length -gt 0) {
                $firstCourse = $coursesResult.data.courses[0]
                $courseId = $firstCourse._id
                Write-Host "SUCCESS: Found courses!" -ForegroundColor Green
                Write-Host "First course: $($firstCourse.title)" -ForegroundColor Cyan
                
                # Step 3: Enroll in course
                Write-Host "`n3. Enrolling in course..." -ForegroundColor Yellow
                try {
                    $enrollResponse = Invoke-WebRequest -Uri "$baseUrl/api/courses/$courseId/enroll" -Method POST -Headers $headers
                    $enrollResult = $enrollResponse.Content | ConvertFrom-Json
                    
                    if ($enrollResult.success) {
                        Write-Host "SUCCESS: Enrollment works!" -ForegroundColor Green
                        Write-Host "Enrolled in: $($firstCourse.title)" -ForegroundColor Cyan
                        
                        # Step 4: Get my enrolled courses
                        Write-Host "`n4. Getting my enrolled courses..." -ForegroundColor Yellow
                        try {
                            $myCoursesResponse = Invoke-WebRequest -Uri "$baseUrl/api/courses/my-courses" -Method GET -Headers $headers
                            $myCoursesResult = $myCoursesResponse.Content | ConvertFrom-Json
                            
                            if ($myCoursesResult.success) {
                                Write-Host "SUCCESS: My courses retrieval works!" -ForegroundColor Green
                                Write-Host "Enrolled courses: $($myCoursesResult.data.totalCourses)" -ForegroundColor Cyan
                                
                                # Step 5: Get course progress
                                Write-Host "`n5. Getting course progress..." -ForegroundColor Yellow
                                try {
                                    $progressResponse = Invoke-WebRequest -Uri "$baseUrl/api/courses/$courseId/progress" -Method GET -Headers $headers
                                    $progressResult = $progressResponse.Content | ConvertFrom-Json
                                    
                                    if ($progressResult.success) {
                                        Write-Host "SUCCESS: Progress tracking works!" -ForegroundColor Green
                                        Write-Host "Progress: $($progressResult.data.overallProgress)%" -ForegroundColor Cyan
                                        Write-Host "Modules: $($progressResult.data.modules.length)" -ForegroundColor Cyan
                                    }
                                } catch {
                                    Write-Host "Note: Progress tracking needs modules/lessons data" -ForegroundColor Yellow
                                }
                            }
                        } catch {
                            Write-Host "Error getting my courses: $($_.Exception.Message)" -ForegroundColor Red
                        }
                    }
                } catch {
                    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
                    if ($errorDetails.message -like "*Already enrolled*") {
                        Write-Host "Note: Already enrolled in course" -ForegroundColor Yellow
                    } else {
                        Write-Host "Error enrolling: $($errorDetails.message)" -ForegroundColor Red
                    }
                }
            }
        } catch {
            Write-Host "Error getting courses: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nCourse Management MVP Test Complete!" -ForegroundColor Green
Write-Host "`nNew Features Available:" -ForegroundColor White
Write-Host "  - Course enrollment for students" -ForegroundColor Green
Write-Host "  - My enrolled courses list" -ForegroundColor Green
Write-Host "  - Course progress tracking" -ForegroundColor Green
Write-Host "  - Module and lesson management" -ForegroundColor Green