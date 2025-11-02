#!/usr/bin/env python3
"""
Simple AI Service for Testing
This is a stripped-down version to test if the basic functionality works
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Import the intelligent analyzer
from intelligent_code_analyzer import IntelligentCodeAnalyzer

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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Simple AI Service is running"}

if __name__ == "__main__":
    print("🚀 Starting Simple AI Code Analyzer...")
    uvicorn.run(app, host="127.0.0.1", port=8001)