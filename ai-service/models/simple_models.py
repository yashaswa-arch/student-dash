"""
Simple AI Analysis Models
Pydantic models for AI service responses
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class LanguageEnum(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    CPP = "cpp"
    C = "c"
    CSHARP = "csharp"
    GO = "go"
    RUST = "rust"
    PHP = "php"
    RUBY = "ruby"
    SWIFT = "swift"
    KOTLIN = "kotlin"

class SkillLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class IssueType(str, Enum):
    SYNTAX_ERROR = "syntax_error"
    LOGIC_ERROR = "logic_error"
    STYLE_ISSUE = "style_issue"
    PERFORMANCE = "performance"
    SECURITY = "security"
    MAINTAINABILITY = "maintainability"

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class CodeIssue(BaseModel):
    type: IssueType
    severity: Severity
    line: Optional[int] = None
    column: Optional[int] = None
    message: str
    suggestion: Optional[str] = None

class CodeSuggestion(BaseModel):
    type: str
    description: str
    improvement: str
    confidence: float = Field(ge=0.0, le=1.0)

class AIInsight(BaseModel):
    type: str
    confidence: float = Field(ge=0.0, le=1.0)
    message: str
    explanation: str
    learning_resources: List[str] = []

class CodeMetrics(BaseModel):
    lines_of_code: int
    complexity: int
    maintainability_index: float
    test_coverage: Optional[float] = None

class LearningRecommendation(BaseModel):
    title: str
    description: str
    resource_type: str  # "course", "tutorial", "practice", "documentation"
    url: Optional[str] = None
    difficulty: SkillLevel
    estimated_time: Optional[str] = None

class CodeAnalysisRequest(BaseModel):
    code: str
    language: LanguageEnum
    context: Optional[str] = None
    skill_level: SkillLevel = SkillLevel.BEGINNER
    include_suggestions: bool = True
    include_ai_analysis: bool = False  # Default to false since we don't have OpenAI
    include_recommendations: bool = True

class CodeAnalysisResponse(BaseModel):
    analysis_id: str
    code_quality: float = Field(ge=0.0, le=10.0)
    issues: List[CodeIssue]
    suggestions: List[CodeSuggestion]
    ai_insights: List[AIInsight]
    learning_recommendations: List[LearningRecommendation]
    metrics: CodeMetrics
    timestamp: str

class QuickAnalysisResult(BaseModel):
    quality_score: float = Field(ge=0.0, le=10.0)
    major_issues: List[str]
    suggestions: List[str]
    analysis_time: float