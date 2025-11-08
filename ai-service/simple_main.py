#!/usr/bin/env python3
"""
Simple AI Service for Testing
This is a stripped-down version to test if the basic functionality works
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn

# Import the intelligent analyzer
from intelligent_code_analyzer import IntelligentCodeAnalyzer
from mentor_analyzer import analyze_with_mentor
from leetcode_analyzer import analyze_leetcode_code

app = FastAPI(title="Simple AI Code Analyzer", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analyzer
analyzer = IntelligentCodeAnalyzer()

class SimpleRequest(BaseModel):
    code: str
    language: str
    user_id: Optional[str] = "test_user"

class MentorRequest(BaseModel):
    code: str
    language: str
    problemData: Dict[str, Any]
    testResults: Dict[str, Any]
    userHistory: Dict[str, Any]

@app.post("/analyze")
async def analyze_code(request: SimpleRequest):
    try:
        print(f"📝 Analyzing {request.language} code: {request.code[:50]}...")
        
        # Use the intelligent analyzer
        result = analyzer.analyze_code(
            code=request.code,
            language=request.language.lower()
        )
        
        print(f"✅ Analysis complete. Issues: {len(result.get('issues', []))}")
        
        # Format the response to match frontend expectations
        formatted_response = {
            "success": True,
            "quality_score": result.get('quality_score', 0),
            "issues": result.get('issues', []),
            "suggestions": result.get('suggestions', []),
            "learning_recommendations": result.get('learning_recommendations', []),
            "metrics": result.get('metrics', {}),
            "insights": result.get('insights', []),
            "analysis_mode": "intelligent",
            "language_support": "enhanced" if request.language.lower() in ["python", "javascript", "java"] else "basic"
        }
        
        return formatted_response
        
    except Exception as e:
        print(f"❌ Analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/mentor/analyze")
async def mentor_analyze(request: MentorRequest):
    """
    Analyze code with AI Mentor coaching style
    Returns structured feedback with teaching tone
    """
    try:
        print(f"🧑‍🏫 Mentor analyzing {request.language} code for problem: {request.problemData.get('title', 'Unknown')}")
        
        # First get CodeBERT analysis
        codebert_result = analyzer.analyze_code(
            code=request.code,
            language=request.language.lower()
        )
        
        # Build submission data
        # Safely extract insights
        insights = codebert_result.get('insights', [])
        first_insight = insights[0] if insights else {}
        approach = first_insight.get('type', 'Unknown') if isinstance(first_insight, dict) else str(first_insight) if first_insight else 'Unknown'
        
        submission_data = {
            "code": request.code,
            "language": request.language,
            "testResults": request.testResults,
            "codebertAnalysis": {
                "approach": approach,
                "complexity": codebert_result.get('metrics', {}).get('complexity_estimate', 'O(n)'),
                "spaceComplexity": "O(1)",  # TODO: Extract from actual analysis
                "quality_score": codebert_result.get('quality_score', 0)
            }
        }
        
        # Call mentor analyzer
        mentor_feedback = analyze_with_mentor(
            problem_data=request.problemData,
            submission_data=submission_data,
            user_history=request.userHistory
        )
        
        print(f"✅ Mentor analysis complete. Correctness: {mentor_feedback.get('correctness', False)}")
        
        return {
            "success": True,
            "mentorFeedback": mentor_feedback,
            "codebertAnalysis": codebert_result
        }
        
    except Exception as e:
        print(f"❌ Mentor analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=f"Mentor analysis failed: {str(e)}")

class LeetCodeRequest(BaseModel):
    code: str
    language: str
    problemTitle: str
    problemDescription: str

@app.post("/leetcode/analyze")
async def analyze_leetcode(request: LeetCodeRequest):
    """
    Analyze LeetCode solution code
    Returns complexity analysis, mistakes, improvements, and hints
    """
    try:
        print(f"🔍 Analyzing LeetCode solution for: {request.problemTitle}")
        
        feedback = analyze_leetcode_code(
            code=request.code,
            language=request.language,
            problem_title=request.problemTitle,
            problem_description=request.problemDescription
        )
        
        print(f"✅ Analysis complete. Time: {feedback.get('timeComplexity')}, Space: {feedback.get('spaceComplexity')}")
        
        return feedback
        
    except Exception as e:
        print(f"❌ LeetCode analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Simple AI Service is running"}

if __name__ == "__main__":
    print("🚀 Starting Simple AI Code Analyzer...")
    uvicorn.run(app, host="127.0.0.1", port=8001)