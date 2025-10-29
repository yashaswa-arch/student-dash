"""
Code Analysis Service
Static code analysis using various tools and techniques
"""

import ast
import re
import logging
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
import json

# Third-party analysis tools
try:
    import pylint.lint
    import pylint.reporters.text
    from pylint.reporters import JSONReporter
    PYLINT_AVAILABLE = True
except ImportError:
    PYLINT_AVAILABLE = False

try:
    import bandit
    from bandit.core import manager, config
    BANDIT_AVAILABLE = True
except ImportError:
    BANDIT_AVAILABLE = False

try:
    from radon.complexity import cc_visit
    from radon.metrics import mi_visit, h_visit
    RADON_AVAILABLE = True
except ImportError:
    RADON_AVAILABLE = False

from models.analysis_models import (
    CodeIssue, CodeSuggestion, CodeMetrics, QuickAnalysisResult,
    IssueSeverityEnum, LanguageEnum
)
from utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class CodeAnalyzer:
    """Static code analysis service"""
    
    def __init__(self):
        self.supported_languages = {
            'python': self._analyze_python,
            'javascript': self._analyze_javascript,
            'typescript': self._analyze_typescript,
            'java': self._analyze_java,
            'cpp': self._analyze_cpp,
            'c': self._analyze_c,
            'csharp': self._analyze_csharp,
            'go': self._analyze_go,
            'rust': self._analyze_rust,
            'php': self._analyze_php,
            'ruby': self._analyze_ruby,
            'swift': self._analyze_swift,
            'kotlin': self._analyze_kotlin
        }
        
    async def analyze_code(self, code: str, language: str, include_suggestions: bool = True) -> Any:
        """
        Perform comprehensive code analysis
        
        Args:
            code: Source code to analyze
            language: Programming language
            include_suggestions: Whether to include improvement suggestions
            
        Returns:
            Analysis result with issues, suggestions, and metrics
        """
        start_time = datetime.now()
        
        try:
            # Get language-specific analyzer
            analyzer = self.supported_languages.get(language.lower())
            if not analyzer:
                return self._create_basic_analysis(code, language)
            
            # Run analysis
            result = await analyzer(code, include_suggestions)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            result.processing_time = processing_time
            
            logger.info(f"Code analysis completed for {language} in {processing_time:.2f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Code analysis failed for {language}: {e}")
            return self._create_error_analysis(str(e))
    
    async def quick_analysis(self, code: str, language: str) -> QuickAnalysisResult:
        """
        Quick code quality assessment
        
        Args:
            code: Source code to analyze
            language: Programming language
            
        Returns:
            Quick analysis result
        """
        start_time = datetime.now()
        
        try:
            # Basic metrics
            lines_of_code = len([line for line in code.split('\n') if line.strip()])
            
            # Quick issue detection
            issues = self._detect_basic_issues(code, language)
            major_issues = [issue for issue in issues if issue.severity in ['error', 'warning']]
            
            # Simple quality score calculation
            quality_score = self._calculate_quick_quality_score(code, issues, lines_of_code)
            
            analysis_time = (datetime.now() - start_time).total_seconds()
            
            return QuickAnalysisResult(
                quality_score=quality_score,
                major_issues=major_issues,
                suggestions_count=len([i for i in issues if i.severity == 'suggestion']),
                analysis_time=analysis_time
            )
            
        except Exception as e:
            logger.error(f"Quick analysis failed: {e}")
            return QuickAnalysisResult(
                quality_score=0.0,
                major_issues=[],
                suggestions_count=0,
                analysis_time=0.0
            )

    async def _analyze_python(self, code: str, include_suggestions: bool) -> Any:
        """Analyze Python code"""
        issues = []
        suggestions = []
        
        # AST-based analysis
        try:
            tree = ast.parse(code)
            issues.extend(self._analyze_python_ast(tree))
        except SyntaxError as e:
            issues.append(CodeIssue(
                severity=IssueSeverityEnum.ERROR,
                message=f"Syntax error: {e.msg}",
                line=e.lineno,
                column=e.offset,
                category="syntax"
            ))
        
        # Pylint analysis (if available)
        if PYLINT_AVAILABLE:
            pylint_issues = await self._run_pylint(code)
            issues.extend(pylint_issues)
        
        # Security analysis with Bandit (if available)
        if BANDIT_AVAILABLE:
            security_issues = await self._run_bandit(code)
            issues.extend(security_issues)
        
        # Complexity analysis with Radon (if available)
        metrics = await self._calculate_python_metrics(code)
        
        # Generate suggestions
        if include_suggestions:
            suggestions = self._generate_python_suggestions(code, issues)
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        
        return self._create_analysis_result(quality_score, issues, suggestions, metrics)
    
    async def _analyze_javascript(self, code: str, include_suggestions: bool) -> Any:
        """Analyze JavaScript code"""
        issues = []
        suggestions = []
        
        # Basic pattern-based analysis
        issues.extend(self._analyze_js_patterns(code))
        
        # Calculate basic metrics
        metrics = self._calculate_basic_metrics(code)
        
        # Generate suggestions
        if include_suggestions:
            suggestions = self._generate_js_suggestions(code)
        
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        
        return self._create_analysis_result(quality_score, issues, suggestions, metrics)
    
    async def _analyze_typescript(self, code: str, include_suggestions: bool) -> Any:
        """Analyze TypeScript code (similar to JavaScript with type checking)"""
        return await self._analyze_javascript(code, include_suggestions)
    
    async def _analyze_java(self, code: str, include_suggestions: bool) -> Any:
        """Analyze Java code"""
        issues = []
        suggestions = []
        
        # Pattern-based analysis for Java
        issues.extend(self._analyze_java_patterns(code))
        
        # Calculate metrics
        metrics = self._calculate_basic_metrics(code)
        
        # Generate suggestions
        if include_suggestions:
            suggestions = self._generate_java_suggestions(code)
        
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        
        return self._create_analysis_result(quality_score, issues, suggestions, metrics)
    
    def _analyze_python_ast(self, tree: ast.AST) -> List[CodeIssue]:
        """Analyze Python AST for issues"""
        issues = []
        
        class IssueDetector(ast.NodeVisitor):
            def visit_FunctionDef(self, node):
                # Check for functions without docstrings
                if not ast.get_docstring(node):
                    issues.append(CodeIssue(
                        severity=IssueSeverityEnum.INFO,
                        message=f"Function '{node.name}' missing docstring",
                        line=node.lineno,
                        category="documentation"
                    ))
                
                # Check for too many arguments
                if len(node.args.args) > 5:
                    issues.append(CodeIssue(
                        severity=IssueSeverityEnum.WARNING,
                        message=f"Function '{node.name}' has too many parameters ({len(node.args.args)})",
                        line=node.lineno,
                        category="complexity"
                    ))
                
                self.generic_visit(node)
            
            def visit_Name(self, node):
                # Check for unused variables (basic check)
                if isinstance(node.ctx, ast.Store) and node.id.startswith('_unused'):
                    issues.append(CodeIssue(
                        severity=IssueSeverityEnum.INFO,
                        message=f"Variable '{node.id}' appears to be unused",
                        line=node.lineno,
                        category="style"
                    ))
                
                self.generic_visit(node)
        
        detector = IssueDetector()
        detector.visit(tree)
        
        return issues
    
    def _analyze_js_patterns(self, code: str) -> List[CodeIssue]:
        """Analyze JavaScript code patterns"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for console.log statements
            if 'console.log' in line:
                issues.append(CodeIssue(
                    severity=IssueSeverityEnum.INFO,
                    message="Console.log statement found - consider removing in production",
                    line=i,
                    category="style"
                ))
            
            # Check for == instead of ===
            if re.search(r'[^!]==[^=]', line):
                issues.append(CodeIssue(
                    severity=IssueSeverityEnum.WARNING,
                    message="Use === instead of == for strict equality",
                    line=i,
                    category="best_practice"
                ))
            
            # Check for var usage (prefer let/const)
            if re.search(r'\bvar\s+', line):
                issues.append(CodeIssue(
                    severity=IssueSeverityEnum.INFO,
                    message="Consider using 'let' or 'const' instead of 'var'",
                    line=i,
                    category="modern_syntax"
                ))
        
        return issues
    
    def _analyze_java_patterns(self, code: str) -> List[CodeIssue]:
        """Analyze Java code patterns"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for System.out.println
            if 'System.out.println' in line:
                issues.append(CodeIssue(
                    severity=IssueSeverityEnum.INFO,
                    message="Consider using a logging framework instead of System.out.println",
                    line=i,
                    category="best_practice"
                ))
            
            # Check for magic numbers
            if re.search(r'\b\d{2,}\b', line) and 'final' not in line:
                issues.append(CodeIssue(
                    severity=IssueSeverityEnum.WARNING,
                    message="Consider extracting magic numbers to named constants",
                    line=i,
                    category="maintainability"
                ))
        
        return issues
    
    def _detect_basic_issues(self, code: str, language: str) -> List[CodeIssue]:
        """Detect basic issues across all languages"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check line length
            if len(line) > 120:
                issues.append(CodeIssue(
                    severity=IssueSeverityEnum.INFO,
                    message="Line too long (>120 characters)",
                    line=i,
                    category="style"
                ))
            
            # Check for TODO/FIXME comments
            if re.search(r'(TODO|FIXME|HACK)', line, re.IGNORECASE):
                issues.append(CodeIssue(
                    severity=IssueSeverityEnum.INFO,
                    message="Code contains TODO/FIXME comment",
                    line=i,
                    category="maintenance"
                ))
        
        return issues
    
    def _calculate_basic_metrics(self, code: str) -> CodeMetrics:
        """Calculate basic code metrics"""
        lines = code.split('\n')
        lines_of_code = len([line for line in lines if line.strip()])
        
        return CodeMetrics(
            lines_of_code=lines_of_code,
            cyclomatic_complexity=None,
            maintainability_index=None,
            technical_debt_ratio=None
        )
    
    async def _calculate_python_metrics(self, code: str) -> CodeMetrics:
        """Calculate Python-specific metrics using Radon"""
        lines_of_code = len([line for line in code.split('\n') if line.strip()])
        
        metrics = CodeMetrics(lines_of_code=lines_of_code)
        
        if RADON_AVAILABLE:
            try:
                # Cyclomatic complexity
                cc_results = cc_visit(code)
                if cc_results:
                    avg_complexity = sum(item.complexity for item in cc_results) / len(cc_results)
                    metrics.cyclomatic_complexity = int(avg_complexity)
                
                # Maintainability index
                mi_results = mi_visit(code, multi=True)
                if mi_results:
                    metrics.maintainability_index = mi_results
                
            except Exception as e:
                logger.warning(f"Failed to calculate Python metrics: {e}")
        
        return metrics
    
    def _calculate_quality_score(self, issues: List[CodeIssue], metrics: CodeMetrics, lines_of_code: int) -> float:
        """Calculate overall code quality score (0-100)"""
        base_score = 100.0
        
        # Deduct points for issues
        for issue in issues:
            if issue.severity == IssueSeverityEnum.ERROR:
                base_score -= 10
            elif issue.severity == IssueSeverityEnum.WARNING:
                base_score -= 5
            elif issue.severity == IssueSeverityEnum.INFO:
                base_score -= 2
        
        # Factor in complexity
        if metrics.cyclomatic_complexity:
            if metrics.cyclomatic_complexity > 10:
                base_score -= (metrics.cyclomatic_complexity - 10) * 2
        
        # Factor in maintainability
        if metrics.maintainability_index and metrics.maintainability_index < 50:
            base_score -= (50 - metrics.maintainability_index) * 0.5
        
        return max(0.0, min(100.0, base_score))
    
    def _calculate_quick_quality_score(self, code: str, issues: List[CodeIssue], lines_of_code: int) -> float:
        """Quick quality score calculation"""
        base_score = 80.0  # Start with a reasonable base
        
        # Deduct for issues
        error_count = len([i for i in issues if i.severity == 'error'])
        warning_count = len([i for i in issues if i.severity == 'warning'])
        
        base_score -= error_count * 15
        base_score -= warning_count * 5
        
        # Factor in code length (very long functions might be complex)
        if lines_of_code > 100:
            base_score -= (lines_of_code - 100) * 0.1
        
        return max(0.0, min(100.0, base_score))
    
    def _generate_python_suggestions(self, code: str, issues: List[CodeIssue]) -> List[CodeSuggestion]:
        """Generate Python-specific suggestions"""
        suggestions = []
        
        # Add type hints suggestion
        if 'def ' in code and '->' not in code:
            suggestions.append(CodeSuggestion(
                type="best_practice",
                message="Consider adding type hints to improve code clarity",
                impact="medium",
                explanation="Type hints make code more readable and help catch errors early"
            ))
        
        # Add docstring suggestions
        if 'def ' in code and '"""' not in code:
            suggestions.append(CodeSuggestion(
                type="documentation",
                message="Add docstrings to functions and classes",
                impact="high",
                explanation="Docstrings improve code maintainability and help other developers"
            ))
        
        return suggestions
    
    def _generate_js_suggestions(self, code: str) -> List[CodeSuggestion]:
        """Generate JavaScript-specific suggestions"""
        suggestions = []
        
        # Suggest const/let over var
        if 'var ' in code:
            suggestions.append(CodeSuggestion(
                type="modern_syntax",
                message="Use 'const' or 'let' instead of 'var'",
                impact="medium",
                explanation="const/let have block scope and prevent hoisting issues"
            ))
        
        return suggestions
    
    def _generate_java_suggestions(self, code: str) -> List[CodeSuggestion]:
        """Generate Java-specific suggestions"""
        suggestions = []
        
        # Suggest StringBuilder for string concatenation
        if '+=' in code and 'String' in code:
            suggestions.append(CodeSuggestion(
                type="performance",
                message="Consider using StringBuilder for multiple string concatenations",
                impact="medium",
                explanation="StringBuilder is more efficient for building strings in loops"
            ))
        
        return suggestions
    
    def _create_analysis_result(self, quality_score: float, issues: List[CodeIssue], 
                              suggestions: List[CodeSuggestion], metrics: CodeMetrics) -> Any:
        """Create analysis result object"""
        class AnalysisResult:
            def __init__(self):
                self.quality_score = quality_score
                self.issues = issues
                self.suggestions = suggestions
                self.metrics = metrics
                self.processing_time = None
        
        return AnalysisResult()
    
    def _create_basic_analysis(self, code: str, language: str) -> Any:
        """Create basic analysis for unsupported languages"""
        issues = self._detect_basic_issues(code, language)
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    def _create_error_analysis(self, error_message: str) -> Any:
        """Create error analysis result"""
        class ErrorResult:
            def __init__(self):
                self.quality_score = 0.0
                self.issues = [CodeIssue(
                    severity=IssueSeverityEnum.ERROR,
                    message=f"Analysis failed: {error_message}",
                    category="analysis_error"
                )]
                self.suggestions = []
                self.metrics = CodeMetrics(lines_of_code=0)
                self.processing_time = 0.0
        
        return ErrorResult()
    
    # Placeholder methods for other language analyzers
    async def _analyze_cpp(self, code: str, include_suggestions: bool) -> Any:
        return await self._analyze_c(code, include_suggestions)
    
    async def _analyze_c(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'c')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _analyze_csharp(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'csharp')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _analyze_go(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'go')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _analyze_rust(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'rust')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _analyze_php(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'php')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _analyze_ruby(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'ruby')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _analyze_swift(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'swift')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _analyze_kotlin(self, code: str, include_suggestions: bool) -> Any:
        issues = self._detect_basic_issues(code, 'kotlin')
        metrics = self._calculate_basic_metrics(code)
        quality_score = self._calculate_quality_score(issues, metrics, len(code.split('\n')))
        return self._create_analysis_result(quality_score, issues, [], metrics)
    
    async def _run_pylint(self, code: str) -> List[CodeIssue]:
        """Run Pylint analysis"""
        # This would require setting up Pylint properly
        # For now, return empty list
        return []
    
    async def _run_bandit(self, code: str) -> List[CodeIssue]:
        """Run Bandit security analysis"""
        # This would require setting up Bandit properly
        # For now, return empty list
        return []