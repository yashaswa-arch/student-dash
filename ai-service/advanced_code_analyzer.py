"""
Advanced Code Analysis Engine
Comprehensive multi-language code analysis with specific suggestions
"""

import ast
import re
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

class Severity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class IssueCategory(Enum):
    SYNTAX = "syntax"
    LOGIC = "logic"
    PERFORMANCE = "performance"
    SECURITY = "security"
    STYLE = "style"
    MAINTAINABILITY = "maintainability"
    BEST_PRACTICE = "best_practice"

@dataclass
class CodeIssue:
    category: IssueCategory
    severity: Severity
    line_number: Optional[int]
    column: Optional[int]
    message: str
    detailed_explanation: str
    suggestion: str
    example_fix: Optional[str]
    learn_more_url: Optional[str]

@dataclass
class CodeSuggestion:
    title: str
    description: str
    improvement_type: str
    code_before: Optional[str]
    code_after: Optional[str]
    impact: str
    difficulty: str  # 'easy', 'medium', 'hard'

@dataclass
class LearningRecommendation:
    topic: str
    reason: str
    resource_type: str  # 'tutorial', 'practice', 'documentation', 'course'
    estimated_time: str
    priority: int  # 1-5, where 1 is highest priority

class AdvancedCodeAnalyzer:
    """
    Comprehensive code analyzer with language-specific rules
    """
    
    def __init__(self):
        self.language_analyzers = {
            'python': PythonAnalyzer(),
            'javascript': JavaScriptAnalyzer(),
            'typescript': TypeScriptAnalyzer(),
            'java': JavaAnalyzer(),
            'cpp': CppAnalyzer(),
            'c': CAnalyzer(),
            'csharp': CSharpAnalyzer()
        }
    
    def analyze_code(self, code: str, language: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform comprehensive code analysis
        """
        # Normalize language
        language = language.lower()
        
        if language not in self.language_analyzers:
            return self._unsupported_language_response(language)
        
        analyzer = self.language_analyzers[language]
        
        # Perform analysis
        issues = analyzer.find_issues(code)
        suggestions = analyzer.generate_suggestions(code, issues)
        metrics = analyzer.calculate_metrics(code)
        recommendations = analyzer.get_learning_recommendations(issues, metrics)
        quality_score = analyzer.calculate_quality_score(issues, metrics)
        
        return {
            'language': language,
            'quality_score': quality_score,
            'issues': [self._issue_to_dict(issue) for issue in issues],
            'suggestions': [self._suggestion_to_dict(suggestion) for suggestion in suggestions],
            'learning_recommendations': [self._recommendation_to_dict(rec) for rec in recommendations],
            'metrics': metrics,
            'analysis_timestamp': datetime.now().isoformat(),
            'total_lines': len(code.split('\n')),
            'total_characters': len(code)
        }
    
    def _issue_to_dict(self, issue: CodeIssue) -> Dict[str, Any]:
        return {
            'category': issue.category.value,
            'severity': issue.severity.value,
            'line_number': issue.line_number,
            'column': issue.column,
            'message': issue.message,
            'detailed_explanation': issue.detailed_explanation,
            'suggestion': issue.suggestion,
            'example_fix': issue.example_fix,
            'learn_more_url': issue.learn_more_url
        }
    
    def _suggestion_to_dict(self, suggestion: CodeSuggestion) -> Dict[str, Any]:
        return {
            'title': suggestion.title,
            'description': suggestion.description,
            'improvement_type': suggestion.improvement_type,
            'code_before': suggestion.code_before,
            'code_after': suggestion.code_after,
            'impact': suggestion.impact,
            'difficulty': suggestion.difficulty
        }
    
    def _recommendation_to_dict(self, rec: LearningRecommendation) -> Dict[str, Any]:
        return {
            'topic': rec.topic,
            'reason': rec.reason,
            'resource_type': rec.resource_type,
            'estimated_time': rec.estimated_time,
            'priority': rec.priority
        }
    
    def _unsupported_language_response(self, language: str) -> Dict[str, Any]:
        return {
            'language': language,
            'quality_score': 0,
            'issues': [{
                'category': 'unsupported',
                'severity': 'info',
                'message': f'Language "{language}" is not yet supported',
                'suggestion': 'Try using: python, javascript, typescript, java, cpp, c, or csharp'
            }],
            'suggestions': [],
            'learning_recommendations': [],
            'metrics': {'supported': False}
        }

class PythonAnalyzer:
    """
    Advanced Python code analyzer
    """
    
    def find_issues(self, code: str) -> List[CodeIssue]:
        issues = []
        lines = code.split('\n')
        
        # Try to parse AST for syntax checking
        try:
            tree = ast.parse(code)
            issues.extend(self._analyze_ast(tree, lines))
        except SyntaxError as e:
            issues.append(CodeIssue(
                category=IssueCategory.SYNTAX,
                severity=Severity.CRITICAL,
                line_number=e.lineno,
                column=e.offset,
                message=f"Syntax Error: {e.msg}",
                detailed_explanation="Python syntax error prevents code execution",
                suggestion="Fix the syntax error according to Python grammar rules",
                example_fix=None,
                learn_more_url="https://docs.python.org/3/tutorial/errors.html"
            ))
        
        # Style and best practice checks
        issues.extend(self._check_style_issues(lines))
        issues.extend(self._check_security_issues(code, lines))
        issues.extend(self._check_performance_issues(code, lines))
        
        return issues
    
    def _analyze_ast(self, tree: ast.AST, lines: List[str]) -> List[CodeIssue]:
        issues = []
        
        for node in ast.walk(tree):
            # Check for common issues
            if isinstance(node, ast.FunctionDef):
                if len(node.body) > 20:
                    issues.append(CodeIssue(
                        category=IssueCategory.MAINTAINABILITY,
                        severity=Severity.MEDIUM,
                        line_number=node.lineno,
                        column=node.col_offset,
                        message=f"Function '{node.name}' is too long ({len(node.body)} statements)",
                        detailed_explanation="Long functions are harder to understand, test, and maintain",
                        suggestion="Break this function into smaller, more focused functions",
                        example_fix="# Split into multiple functions\ndef helper_function():\n    # Move some logic here\n    pass",
                        learn_more_url="https://refactoring.guru/extract-method"
                    ))
            
            # Check for bare except clauses
            if isinstance(node, ast.ExceptHandler) and node.type is None:
                issues.append(CodeIssue(
                    category=IssueCategory.BEST_PRACTICE,
                    severity=Severity.HIGH,
                    line_number=node.lineno,
                    column=node.col_offset,
                    message="Bare 'except:' clause catches all exceptions",
                    detailed_explanation="This can hide important errors and make debugging difficult",
                    suggestion="Specify the exception types you want to catch",
                    example_fix="except ValueError as e:\n    # Handle specific exception",
                    learn_more_url="https://docs.python.org/3/tutorial/errors.html#handling-exceptions"
                ))
        
        return issues
    
    def _check_style_issues(self, lines: List[str]) -> List[CodeIssue]:
        issues = []
        
        for i, line in enumerate(lines, 1):
            # Check line length
            if len(line) > 88:  # PEP 8 recommends 79, but 88 is acceptable
                issues.append(CodeIssue(
                    category=IssueCategory.STYLE,
                    severity=Severity.LOW,
                    line_number=i,
                    column=89,
                    message=f"Line too long ({len(line)} characters)",
                    detailed_explanation="PEP 8 recommends lines be no longer than 79-88 characters",
                    suggestion="Break long lines using parentheses, backslashes, or refactoring",
                    example_fix="# Break long lines:\nresult = some_function(\n    parameter1,\n    parameter2\n)",
                    learn_more_url="https://pep8.org/#maximum-line-length"
                ))
            
            # Check for tabs
            if '\t' in line:
                issues.append(CodeIssue(
                    category=IssueCategory.STYLE,
                    severity=Severity.MEDIUM,
                    line_number=i,
                    column=line.index('\t') + 1,
                    message="Use spaces instead of tabs for indentation",
                    detailed_explanation="PEP 8 recommends using 4 spaces for indentation",
                    suggestion="Replace tabs with 4 spaces",
                    example_fix="    # Use 4 spaces instead of tabs",
                    learn_more_url="https://pep8.org/#indentation"
                ))
        
        return issues
    
    def _check_security_issues(self, code: str, lines: List[str]) -> List[CodeIssue]:
        issues = []
        
        # Check for eval() usage
        if 'eval(' in code:
            for i, line in enumerate(lines, 1):
                if 'eval(' in line:
                    issues.append(CodeIssue(
                        category=IssueCategory.SECURITY,
                        severity=Severity.CRITICAL,
                        line_number=i,
                        column=line.index('eval(') + 1,
                        message="Use of eval() is dangerous",
                        detailed_explanation="eval() executes arbitrary Python code and can be exploited",
                        suggestion="Use ast.literal_eval() for safe evaluation or avoid eval() entirely",
                        example_fix="import ast\nresult = ast.literal_eval(expression)",
                        learn_more_url="https://docs.python.org/3/library/ast.html#ast.literal_eval"
                    ))
        
        return issues
    
    def _check_performance_issues(self, code: str, lines: List[str]) -> List[CodeIssue]:
        issues = []
        
        # Check for string concatenation in loops
        for i, line in enumerate(lines, 1):
            if re.search(r'for\s+\w+\s+in.*:\s*\w+\s*\+=\s*.*', line):
                issues.append(CodeIssue(
                    category=IssueCategory.PERFORMANCE,
                    severity=Severity.MEDIUM,
                    line_number=i,
                    column=1,
                    message="String concatenation in loop is inefficient",
                    detailed_explanation="String concatenation in loops creates many temporary objects",
                    suggestion="Use list.append() and ''.join() or use a list comprehension",
                    example_fix="# Instead of: result += item\n# Use: items.append(item)\nresult = ''.join(items)",
                    learn_more_url="https://docs.python.org/3/faq/programming.html#what-is-the-most-efficient-way-to-concatenate-many-strings-together"
                ))
        
        return issues
    
    def generate_suggestions(self, code: str, issues: List[CodeIssue]) -> List[CodeSuggestion]:
        suggestions = []
        
        # Analyze code patterns and suggest improvements
        if 'print(' in code:
            suggestions.append(CodeSuggestion(
                title="Consider using logging instead of print",
                description="For production code, logging provides better control over output",
                improvement_type="best_practice",
                code_before="print('Debug info:', value)",
                code_after="import logging\nlogging.info('Debug info: %s', value)",
                impact="Better debugging and production monitoring",
                difficulty="easy"
            ))
        
        # Check for missing docstrings
        if 'def ' in code and '"""' not in code and "'''" not in code:
            suggestions.append(CodeSuggestion(
                title="Add docstrings to your functions",
                description="Docstrings help other developers understand your code",
                improvement_type="documentation",
                code_before="def my_function(x):\n    return x * 2",
                code_after='def my_function(x):\n    """Double the input value.\n    \n    Args:\n        x: Number to double\n    \n    Returns:\n        Doubled value\n    """\n    return x * 2',
                impact="Improved code documentation and maintainability",
                difficulty="easy"
            ))
        
        return suggestions
    
    def calculate_metrics(self, code: str) -> Dict[str, Any]:
        lines = code.split('\n')
        non_empty_lines = [line for line in lines if line.strip()]
        
        # Calculate complexity (simplified)
        complexity = 1  # Base complexity
        complexity += code.count('if ')
        complexity += code.count('elif ')
        complexity += code.count('for ')
        complexity += code.count('while ')
        complexity += code.count('except')
        
        return {
            'total_lines': len(lines),
            'lines_of_code': len(non_empty_lines),
            'blank_lines': len(lines) - len(non_empty_lines),
            'cyclomatic_complexity': complexity,
            'function_count': code.count('def '),
            'class_count': code.count('class '),
            'comment_lines': len([line for line in lines if line.strip().startswith('#')])
        }
    
    def get_learning_recommendations(self, issues: List[CodeIssue], metrics: Dict[str, Any]) -> List[LearningRecommendation]:
        recommendations = []
        
        # Analyze issues and suggest learning topics
        security_issues = [issue for issue in issues if issue.category == IssueCategory.SECURITY]
        if security_issues:
            recommendations.append(LearningRecommendation(
                topic="Python Security Best Practices",
                reason=f"Found {len(security_issues)} security issues in your code",
                resource_type="tutorial",
                estimated_time="30 minutes",
                priority=1
            ))
        
        style_issues = [issue for issue in issues if issue.category == IssueCategory.STYLE]
        if len(style_issues) > 3:
            recommendations.append(LearningRecommendation(
                topic="PEP 8 - Python Style Guide",
                reason="Multiple style issues found",
                resource_type="documentation",
                estimated_time="45 minutes",
                priority=2
            ))
        
        if metrics['cyclomatic_complexity'] > 10:
            recommendations.append(LearningRecommendation(
                topic="Code Refactoring Techniques",
                reason="High code complexity detected",
                resource_type="tutorial",
                estimated_time="1 hour",
                priority=2
            ))
        
        return recommendations
    
    def calculate_quality_score(self, issues: List[CodeIssue], metrics: Dict[str, Any]) -> float:
        base_score = 10.0
        
        # Deduct points for issues
        for issue in issues:
            if issue.severity == Severity.CRITICAL:
                base_score -= 3.0
            elif issue.severity == Severity.HIGH:
                base_score -= 2.0
            elif issue.severity == Severity.MEDIUM:
                base_score -= 1.0
            elif issue.severity == Severity.LOW:
                base_score -= 0.5
        
        # Bonus for good practices
        if metrics.get('comment_lines', 0) > metrics.get('lines_of_code', 1) * 0.1:
            base_score += 0.5  # Bonus for good commenting
        
        return max(0.0, min(10.0, base_score))

# Placeholder analyzers for other languages
class JavaScriptAnalyzer:
    def find_issues(self, code: str) -> List[CodeIssue]:
        issues = []
        lines = code.split('\n')
        
        # Check for var usage
        for i, line in enumerate(lines, 1):
            if 'var ' in line and not line.strip().startswith('//'):
                issues.append(CodeIssue(
                    category=IssueCategory.BEST_PRACTICE,
                    severity=Severity.MEDIUM,
                    line_number=i,
                    column=line.index('var ') + 1,
                    message="Use 'let' or 'const' instead of 'var'",
                    detailed_explanation="'var' has function scope which can lead to unexpected behavior",
                    suggestion="Replace 'var' with 'let' for variables or 'const' for constants",
                    example_fix="let myVariable = value; // or const myConstant = value;",
                    learn_more_url="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let"
                ))
        
        # Check for == instead of ===
        for i, line in enumerate(lines, 1):
            if '==' in line and '===' not in line and '!==' not in line:
                issues.append(CodeIssue(
                    category=IssueCategory.BEST_PRACTICE,
                    severity=Severity.MEDIUM,
                    line_number=i,
                    column=line.index('==') + 1,
                    message="Use strict equality (===) instead of loose equality (==)",
                    detailed_explanation="=== checks both value and type, preventing type coercion bugs",
                    suggestion="Replace == with === and != with !==",
                    example_fix="if (value === 'expected') { // strict comparison }",
                    learn_more_url="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness"
                ))
        
        return issues
    
    def generate_suggestions(self, code: str, issues: List[CodeIssue]) -> List[CodeSuggestion]:
        suggestions = []
        
        if 'function(' in code:
            suggestions.append(CodeSuggestion(
                title="Consider using arrow functions",
                description="Arrow functions provide cleaner syntax and lexical 'this' binding",
                improvement_type="modern_syntax",
                code_before="function(x) { return x * 2; }",
                code_after="(x) => x * 2",
                impact="More concise and modern JavaScript",
                difficulty="easy"
            ))
        
        return suggestions
    
    def calculate_metrics(self, code: str) -> Dict[str, Any]:
        lines = code.split('\n')
        return {
            'total_lines': len(lines),
            'function_count': code.count('function') + code.count('=>'),
            'class_count': code.count('class '),
            'comment_lines': len([line for line in lines if line.strip().startswith('//')])
        }
    
    def get_learning_recommendations(self, issues: List[CodeIssue], metrics: Dict[str, Any]) -> List[LearningRecommendation]:
        recommendations = []
        
        if any(issue.message.startswith("Use 'let'") for issue in issues):
            recommendations.append(LearningRecommendation(
                topic="Modern JavaScript ES6+ Features",
                reason="Code uses outdated JavaScript patterns",
                resource_type="tutorial",
                estimated_time="45 minutes",
                priority=2
            ))
        
        return recommendations
    
    def calculate_quality_score(self, issues: List[CodeIssue], metrics: Dict[str, Any]) -> float:
        base_score = 10.0
        for issue in issues:
            if issue.severity == Severity.CRITICAL:
                base_score -= 3.0
            elif issue.severity == Severity.HIGH:
                base_score -= 2.0
            elif issue.severity == Severity.MEDIUM:
                base_score -= 1.0
        return max(0.0, min(10.0, base_score))

# Placeholder classes for other languages
class TypeScriptAnalyzer(JavaScriptAnalyzer):
    pass

class JavaAnalyzer:
    def find_issues(self, code: str) -> List[CodeIssue]:
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            line_stripped = line.strip()
            if not line_stripped:
                continue
                
            # Check for System.out.print without parentheses
            if re.search(r'System\.out\.print\s+\w+', line_stripped):
                issues.append(CodeIssue(
                    category=IssueCategory.SYNTAX_ERROR,
                    severity=Severity.CRITICAL,
                    line_number=i,
                    column=line.find('System.out.print') + 1,
                    message="Missing parentheses after System.out.print",
                    detailed_explanation="Java methods require parentheses even when called without arguments",
                    suggestion="Add parentheses around the arguments: System.out.print(\"your text\")",
                    example_fix="System.out.print(\"Hello World\");",
                    learn_more_url="https://docs.oracle.com/javase/tutorial/java/nutsandbolts/expressions.html"
                ))
            
            # Check for System.out.println without parentheses
            if re.search(r'System\.out\.println\s+\w+', line_stripped):
                issues.append(CodeIssue(
                    category=IssueCategory.SYNTAX_ERROR,
                    severity=Severity.CRITICAL,
                    line_number=i,
                    column=line.find('System.out.println') + 1,
                    message="Missing parentheses after System.out.println",
                    detailed_explanation="Java methods require parentheses even when called without arguments",
                    suggestion="Add parentheses around the arguments: System.out.println(\"your text\")",
                    example_fix="System.out.println(\"Hello World\");",
                    learn_more_url="https://docs.oracle.com/javase/tutorial/java/nutsandbolts/expressions.html"
                ))
            
            # Check for missing semicolon
            if (line_stripped and 
                not line_stripped.endswith(';') and 
                not line_stripped.endswith('{') and 
                not line_stripped.endswith('}') and
                not line_stripped.startswith('//') and
                not line_stripped.startswith('/*') and
                not line_stripped.startswith('*') and
                not line_stripped.startswith('package') and
                not line_stripped.startswith('import') and
                not re.match(r'^\s*(public|private|protected)?\s*(class|interface|enum)', line_stripped) and
                not re.match(r'^\s*(if|else|for|while|do|switch|try|catch|finally)', line_stripped) and
                re.search(r'(System\.out\.|=|\w+\()', line_stripped)):
                
                issues.append(CodeIssue(
                    category=IssueCategory.SYNTAX_ERROR,
                    severity=Severity.CRITICAL,
                    line_number=i,
                    column=len(line_stripped) + 1,
                    message="Missing semicolon at end of statement",
                    detailed_explanation="Java statements must end with a semicolon",
                    suggestion="Add a semicolon (;) at the end of the statement",
                    example_fix=line_stripped + ";",
                    learn_more_url="https://docs.oracle.com/javase/tutorial/java/nutsandbolts/expressions.html"
                ))
            
            # Check for incorrect case in System
            if re.search(r'system\.out', line_stripped, re.IGNORECASE) and not 'System.out' in line_stripped:
                issues.append(CodeIssue(
                    category=IssueCategory.SYNTAX_ERROR,
                    severity=Severity.CRITICAL,
                    line_number=i,
                    column=line.lower().find('system') + 1,
                    message="Incorrect capitalization: 'system' should be 'System'",
                    detailed_explanation="Java is case-sensitive. Class names like 'System' must be capitalized",
                    suggestion="Change 'system' to 'System' (capital S)",
                    example_fix=line_stripped.replace('system', 'System'),
                    learn_more_url="https://docs.oracle.com/javase/tutorial/java/nutsandbolts/variables.html"
                ))
            
            # Check for missing quotes around strings
            if re.search(r'System\.out\.print(ln)?\([^"\']*[a-zA-Z]+[^"\']*\)', line_stripped):
                match = re.search(r'System\.out\.print(ln)?\(([^)]+)\)', line_stripped)
                if match and not ('"' in match.group(2) or "'" in match.group(2)):
                    issues.append(CodeIssue(
                        category=IssueCategory.SYNTAX_ERROR,
                        severity=Severity.CRITICAL,
                        line_number=i,
                        column=line.find('(') + 1,
                        message="String literals must be enclosed in quotes",
                        detailed_explanation="Text in Java must be wrapped in double quotes to be treated as a string",
                        suggestion="Wrap your text in double quotes",
                        example_fix=f"System.out.println(\"{match.group(2).strip()}\");",
                        learn_more_url="https://docs.oracle.com/javase/tutorial/java/data/strings.html"
                    ))
            
            # Check for missing class declaration
            if i == 1 and not any('class' in l for l in lines[:5]):
                issues.append(CodeIssue(
                    category=IssueCategory.BEST_PRACTICE,
                    severity=Severity.HIGH,
                    line_number=1,
                    column=1,
                    message="Java code should be inside a class",
                    detailed_explanation="In Java, all executable code must be inside a class and method",
                    suggestion="Wrap your code in a class with a main method",
                    example_fix="public class Main {\n    public static void main(String[] args) {\n        " + line_stripped + "\n    }\n}",
                    learn_more_url="https://docs.oracle.com/javase/tutorial/getStarted/application/index.html"
                ))
        
        return issues
    
    def generate_suggestions(self, code: str, issues: List[CodeIssue]) -> List[CodeSuggestion]:
        suggestions = []
        
        # If there are critical syntax errors, focus on fixing those first
        critical_issues = [issue for issue in issues if issue.severity == Severity.CRITICAL]
        if critical_issues:
            suggestions.append(CodeSuggestion(
                type=SuggestionType.ERROR_FIX,
                priority=Priority.HIGH,
                title="Fix Syntax Errors First",
                description="Your code has syntax errors that prevent it from compiling. Fix these first:",
                code_example="// Before:\nsystem.out.print ln hello world\n\n// After:\nSystem.out.println(\"hello world\");",
                explanation="Java is case-sensitive and requires proper syntax: parentheses for method calls, quotes for strings, semicolons to end statements."
            ))
        
        # Suggest proper Java structure
        if not any('class' in code for code in code.split('\n')):
            suggestions.append(CodeSuggestion(
                type=SuggestionType.BEST_PRACTICE,
                priority=Priority.MEDIUM,
                title="Use Proper Java Class Structure",
                description="Java code should be organized in classes with methods",
                code_example="public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}",
                explanation="This creates a complete, runnable Java program with proper structure."
            ))
        
        return suggestions
    
    def calculate_metrics(self, code: str) -> Dict[str, Any]:
        lines = code.split('\n')
        return {
            'total_lines': len(lines),
            'non_empty_lines': len([l for l in lines if l.strip()]),
            'has_main_method': 'main(' in code,
            'has_class': 'class ' in code,
            'system_out_calls': len(re.findall(r'System\.out\.', code))
        }
    
    def get_learning_recommendations(self, issues: List[CodeIssue], metrics: Dict[str, Any]) -> List[LearningRecommendation]:
        recommendations = []
        
        # If user has syntax errors, recommend basic Java syntax
        if any(issue.category == IssueCategory.SYNTAX_ERROR for issue in issues):
            recommendations.append(LearningRecommendation(
                topic="Java Syntax Basics",
                description="Learn the fundamental syntax rules of Java",
                resources=[
                    "Oracle Java Tutorial: Language Basics",
                    "Java Syntax Cheat Sheet",
                    "Common Java Syntax Errors and Fixes"
                ],
                difficulty_level="Beginner",
                estimated_time="30 minutes"
            ))
        
        # If no class structure, recommend OOP basics
        if not metrics.get('has_class', False):
            recommendations.append(LearningRecommendation(
                topic="Java Classes and Objects",
                description="Understand how Java organizes code using classes",
                resources=[
                    "Oracle Java Tutorial: Classes and Objects",
                    "Introduction to Object-Oriented Programming",
                    "Java Class Structure Best Practices"
                ],
                difficulty_level="Beginner",
                estimated_time="1 hour"
            ))
        
        return recommendations
    
    def calculate_quality_score(self, issues: List[CodeIssue], metrics: Dict[str, Any]) -> float:
        base_score = 10.0
        
        # Deduct points for issues
        for issue in issues:
            if issue.severity == Severity.CRITICAL:
                base_score -= 3.0
            elif issue.severity == Severity.HIGH:
                base_score -= 2.0
            elif issue.severity == Severity.MEDIUM:
                base_score -= 1.0
            else:
                base_score -= 0.5
        
        # Bonus for good structure
        if metrics.get('has_class', False):
            base_score += 1.0
        if metrics.get('has_main_method', False):
            base_score += 1.0
        
        return max(0.0, min(10.0, base_score))

class CppAnalyzer(JavaAnalyzer):
    pass

class CAnalyzer(JavaAnalyzer):
    pass

class CSharpAnalyzer(JavaAnalyzer):
    pass