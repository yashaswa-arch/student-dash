#!/usr/bin/env python3
"""
AI Code Intelligence Service
FastAPI microservice for code analysis, quality scoring, and AI-powered feedback
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import uvicorn
import os
import logging
from datetime import datetime
import json

# Import our custom modules
from services.code_analyzer import CodeAnalyzer
from services.ai_intelligence import AIIntelligence
from services.learning_recommendations import LearningRecommendations
from models.analysis_models import CodeAnalysisRequest, CodeAnalysisResponse
from utils.auth import verify_token
from utils.config import get_settings

# Initialize FastAPI app
app = FastAPI(
    title="AI Code Intelligence Service",
    description="AI-powered code analysis, quality scoring, and learning recommendations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
settings = get_settings()

# Initialize services
code_analyzer = CodeAnalyzer()
ai_intelligence = AIIntelligence()
learning_recommendations = LearningRecommendations()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(settings.log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🤖 AI Code Intelligence Service starting up...")
    await ai_intelligence.initialize()
    logger.info("✅ AI services initialized successfully")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "AI Code Intelligence",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "code_analysis": True,
            "ai_suggestions": settings.enable_openai_analysis,
            "learning_recommendations": settings.enable_learning_recommendations,
            "quality_scoring": True
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test AI service availability
        ai_status = await ai_intelligence.health_check()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "code_analyzer": "operational",
                "ai_intelligence": "operational" if ai_status else "degraded",
                "learning_recommendations": "operational"
            },
            "settings": {
                "openai_enabled": settings.enable_openai_analysis,
                "local_analysis_enabled": settings.enable_local_analysis
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(
    request: CodeAnalysisRequest,
    background_tasks: BackgroundTasks,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Comprehensive code analysis with AI-powered insights
    """
    try:
        # Verify authentication
        user_data = verify_token(credentials.credentials)
        
        logger.info(f"Code analysis requested by user {user_data.get('user_id')}")
        
        # Validate code length
        if len(request.code) > settings.max_code_length:
            raise HTTPException(
                status_code=400, 
                detail=f"Code length exceeds maximum of {settings.max_code_length} characters"
            )
        
        # Perform static analysis
        static_analysis = await code_analyzer.analyze_code(
            code=request.code,
            language=request.language,
            include_suggestions=request.include_suggestions
        )
        
        # AI-powered analysis (if enabled and requested)
        ai_analysis = None
        if settings.enable_openai_analysis and request.include_ai_analysis:
            ai_analysis = await ai_intelligence.analyze_code(
                code=request.code,
                language=request.language,
                context=request.context
            )
        
        # Learning recommendations
        recommendations = None
        if request.include_recommendations:
            recommendations = await learning_recommendations.get_recommendations(
                user_id=user_data.get('user_id'),
                code_quality=static_analysis.quality_score,
                language=request.language,
                skill_level=request.skill_level
            )
        
        # Background task: Store analysis results
        background_tasks.add_task(
            store_analysis_results,
            user_data.get('user_id'),
            request,
            static_analysis,
            ai_analysis
        )
        
        # Combine results
        response = CodeAnalysisResponse(
            analysis_id=f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_data.get('user_id')}",
            code_quality=static_analysis.quality_score,
            issues=static_analysis.issues,
            suggestions=static_analysis.suggestions if request.include_suggestions else [],
            ai_insights=ai_analysis.insights if ai_analysis else [],
            learning_recommendations=recommendations or [],
            metrics=static_analysis.metrics,
            timestamp=datetime.now().isoformat()
        )
        
        logger.info(f"Analysis completed for user {user_data.get('user_id')}: quality score {static_analysis.quality_score}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Code analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")

@app.post("/quick-analysis")
async def quick_analysis(
    code: str,
    language: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Quick code quality assessment without full analysis
    """
    try:
        user_data = verify_token(credentials.credentials)
        
        # Quick static analysis only
        result = await code_analyzer.quick_analysis(code, language)
        
        return {
            "quality_score": result.quality_score,
            "major_issues": result.major_issues,
            "suggestions_count": len(result.suggestions),
            "analysis_time": result.analysis_time
        }
        
    except Exception as e:
        logger.error(f"Quick analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Quick analysis failed")

@app.get("/languages")
async def get_supported_languages():
    """Get list of supported programming languages"""
    return {
        "supported_languages": [
            "javascript", "python", "java", "cpp", "c", "csharp",
            "go", "rust", "typescript", "php", "ruby", "swift", "kotlin"
        ],
        "ai_analysis_languages": [
            "javascript", "python", "java", "cpp", "c", "csharp", "go", "rust"
        ]
    }

@app.get("/recommendations/{user_id}")
async def get_user_recommendations(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get personalized learning recommendations for a user"""
    try:
        user_data = verify_token(credentials.credentials)
        
        # Verify user access (users can only access their own recommendations)
        if user_data.get('user_id') != user_id and user_data.get('role') not in ['admin', 'instructor']:
            raise HTTPException(status_code=403, detail="Access denied")
        
        recommendations = await learning_recommendations.get_user_recommendations(user_id)
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get recommendations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")

async def store_analysis_results(user_id: str, request: CodeAnalysisRequest, static_analysis, ai_analysis):
    """Background task to store analysis results"""
    try:
        # Here you would typically store results in a database
        # For now, we'll log the results
        logger.info(f"Storing analysis results for user {user_id}")
        
        # You could send results back to Node.js backend via HTTP request
        # import httpx
        # async with httpx.AsyncClient() as client:
        #     await client.post(f"{settings.backend_url}/api/ai-analysis", json=results)
        
    except Exception as e:
        logger.error(f"Failed to store analysis results: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.ai_service_host,
        port=settings.ai_service_port,
        reload=True,
        log_level=settings.log_level.lower()
    )