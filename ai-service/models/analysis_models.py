"""
Pydantic models for code analysis requests and responses
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum

class LanguageEnum(str, Enum):
    """Supported programming languages"""
    JAVASCRIPT = "javascript"
    PYTHON = "python"
    JAVA = "java"
    CPP = "cpp"
    C = "c"
    CSHARP = "csharp"
    GO = "go"
    RUST = "rust"
    TYPESCRIPT = "typescript"
    PHP = "php"
    RUBY = "ruby"
    SWIFT = "swift"
    KOTLIN = "kotlin"

class SkillLevelEnum(str, Enum):
    """User skill levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class IssueSeverityEnum(str, Enum):
    """Code issue severity levels"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    SUGGESTION = "suggestion"

class CodeIssue(BaseModel):
    """Individual code issue or problem"""
    severity: IssueSeverityEnum
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    rule: Optional[str] = None
    category: str = Field(..., description="Issue category (syntax, logic, style, performance, security)")
    fix_suggestion: Optional[str] = None

class CodeSuggestion(BaseModel):
    """Code improvement suggestion"""
    type: str = Field(..., description="Type of suggestion (optimization, best_practice, refactor)")
    message: str
    line: Optional[int] = None
    before_code: Optional[str] = None
    after_code: Optional[str] = None
    impact: str = Field(..., description="Expected impact (high, medium, low)")
    explanation: Optional[str] = None

class AIInsight(BaseModel):
    """AI-generated code insight"""
    type: str = Field(..., description="Insight type (pattern, optimization, learning)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    message: str
    code_snippet: Optional[str] = None
    explanation: str
    learning_resources: List[str] = Field(default_factory=list)

class CodeMetrics(BaseModel):
    """Code quality metrics"""
    lines_of_code: int
    cyclomatic_complexity: Optional[int] = None
    maintainability_index: Optional[float] = None
    technical_debt_ratio: Optional[float] = None
    test_coverage: Optional[float] = None
    documentation_ratio: Optional[float] = None
    duplication_percentage: Optional[float] = None

class LearningRecommendation(BaseModel):
    """Personalized learning recommendation"""
    title: str
    description: str
    type: str = Field(..., description="Recommendation type (course, tutorial, practice, concept)")
    difficulty: SkillLevelEnum
    estimated_time: str = Field(..., description="Estimated completion time")
    priority: int = Field(..., ge=1, le=10, description="Priority 1-10")
    resources: List[Dict[str, str]] = Field(default_factory=list)
    skills_improved: List[str] = Field(default_factory=list)

class CodeAnalysisRequest(BaseModel):
    """Request for code analysis"""
    code: str = Field(..., min_length=1, max_length=10000, description="Code to analyze")
    language: LanguageEnum
    context: Optional[str] = Field(None, description="Additional context about the code")
    skill_level: SkillLevelEnum = SkillLevelEnum.BEGINNER
    include_suggestions: bool = True
    include_ai_analysis: bool = True
    include_recommendations: bool = True
    
    @validator('code')
    def validate_code(cls, v):
        if not v.strip():
            raise ValueError('Code cannot be empty')
        return v.strip()

class CodeAnalysisResponse(BaseModel):
    """Response from code analysis"""
    analysis_id: str
    code_quality: float = Field(..., ge=0.0, le=100.0, description="Overall quality score 0-100")
    issues: List[CodeIssue]
    suggestions: List[CodeSuggestion] = Field(default_factory=list)
    ai_insights: List[AIInsight] = Field(default_factory=list)
    learning_recommendations: List[LearningRecommendation] = Field(default_factory=list)
    metrics: CodeMetrics
    timestamp: str
    processing_time: Optional[float] = Field(None, description="Analysis time in seconds")

class QuickAnalysisResult(BaseModel):
    """Quick analysis result"""
    quality_score: float = Field(..., ge=0.0, le=100.0)
    major_issues: List[CodeIssue]
    suggestions_count: int
    analysis_time: float

class AnalysisStatistics(BaseModel):
    """Analysis statistics for reporting"""
    total_analyses: int
    average_quality_score: float
    common_issues: List[Dict[str, Union[str, int]]]
    language_distribution: Dict[str, int]
    improvement_trends: Dict[str, float]

class UserProgress(BaseModel):
    """User coding progress tracking"""
    user_id: str
    total_submissions: int
    average_quality: float
    skill_progression: Dict[str, float]
    strengths: List[str]
    areas_for_improvement: List[str]
    recent_improvements: List[str]
    
class BatchAnalysisRequest(BaseModel):
    """Request for batch code analysis"""
    files: List[Dict[str, str]] = Field(..., description="List of files with 'name' and 'code' keys")
    language: LanguageEnum
    project_context: Optional[str] = None
    include_cross_file_analysis: bool = False

class BatchAnalysisResponse(BaseModel):
    """Response for batch analysis"""
    batch_id: str
    files_analyzed: int
    overall_quality: float
    project_metrics: CodeMetrics
    critical_issues: List[CodeIssue]
    architectural_suggestions: List[CodeSuggestion]
    file_results: List[Dict[str, Any]]
    timestamp: str