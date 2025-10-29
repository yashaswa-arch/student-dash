"""
AI Intelligence Service
OpenAI-powered code analysis and insights
"""

import openai
import asyncio
import logging
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import time

from models.analysis_models import AIInsight, LanguageEnum
from utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class AIIntelligence:
    """AI-powered code analysis using OpenAI"""
    
    def __init__(self):
        self.client = None
        self.is_available = False
        self.last_request_time = 0
        self.request_count = 0
        
    async def initialize(self):
        """Initialize OpenAI client"""
        try:
            if settings.openai_api_key and settings.enable_openai_analysis:
                openai.api_key = settings.openai_api_key
                self.client = openai
                self.is_available = True
                logger.info("✅ OpenAI client initialized successfully")
            else:
                logger.warning("⚠️ OpenAI API key not provided or AI analysis disabled")
                self.is_available = False
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize OpenAI client: {e}")
            self.is_available = False
    
    async def health_check(self) -> bool:
        """Check if AI service is available"""
        return self.is_available and settings.openai_api_key is not None
    
    async def analyze_code(self, code: str, language: str, context: Optional[str] = None) -> Any:
        """
        AI-powered code analysis using OpenAI
        
        Args:
            code: Source code to analyze
            language: Programming language
            context: Additional context about the code
            
        Returns:
            AI analysis result with insights
        """
        if not self.is_available:
            logger.warning("AI analysis not available - OpenAI not configured")
            return self._create_empty_result()
        
        try:
            # Rate limiting
            await self._check_rate_limit()
            
            # Prepare the prompt
            prompt = self._create_analysis_prompt(code, language, context)
            
            # Make OpenAI API call
            response = await self._call_openai_api(prompt)
            
            # Parse response
            insights = self._parse_ai_response(response, language)
            
            logger.info(f"AI analysis completed for {language} code")
            
            return self._create_ai_result(insights)
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return self._create_empty_result()
    
    async def get_code_explanation(self, code: str, language: str) -> str:
        """
        Get AI explanation of what the code does
        
        Args:
            code: Source code to explain
            language: Programming language
            
        Returns:
            Plain text explanation of the code
        """
        if not self.is_available:
            return "AI explanation not available - OpenAI not configured"
        
        try:
            await self._check_rate_limit()
            
            prompt = f"""
            Please explain what this {language} code does in simple terms:
            
            ```{language}
            {code}
            ```
            
            Provide a clear, concise explanation that a beginner could understand.
            Focus on the main purpose and functionality.
            """
            
            response = await self._call_openai_api(prompt, max_tokens=300)
            return response.strip()
            
        except Exception as e:
            logger.error(f"Code explanation failed: {e}")
            return "Unable to generate explanation at this time"
    
    async def suggest_improvements(self, code: str, language: str, skill_level: str = "beginner") -> List[str]:
        """
        Get AI suggestions for code improvements
        
        Args:
            code: Source code to improve
            language: Programming language
            skill_level: User's skill level (beginner, intermediate, advanced)
            
        Returns:
            List of improvement suggestions
        """
        if not self.is_available:
            return ["AI suggestions not available - OpenAI not configured"]
        
        try:
            await self._check_rate_limit()
            
            prompt = f"""
            Please provide improvement suggestions for this {language} code.
            User skill level: {skill_level}
            
            ```{language}
            {code}
            ```
            
            Provide 3-5 specific, actionable suggestions appropriate for a {skill_level} developer.
            Focus on code quality, best practices, and readability.
            Format as a numbered list.
            """
            
            response = await self._call_openai_api(prompt, max_tokens=500)
            
            # Parse numbered list
            suggestions = []
            for line in response.split('\n'):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-') or line.startswith('*')):
                    # Remove numbering/bullets
                    suggestion = re.sub(r'^[\d\-\*\.\)]+\s*', '', line)
                    if suggestion:
                        suggestions.append(suggestion)
            
            return suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            logger.error(f"Improvement suggestions failed: {e}")
            return ["Unable to generate suggestions at this time"]
    
    async def detect_bugs(self, code: str, language: str) -> List[Dict[str, Any]]:
        """
        AI-powered bug detection
        
        Args:
            code: Source code to analyze for bugs
            language: Programming language
            
        Returns:
            List of potential bugs with descriptions
        """
        if not self.is_available:
            return []
        
        try:
            await self._check_rate_limit()
            
            prompt = f"""
            Analyze this {language} code for potential bugs, errors, or issues:
            
            ```{language}
            {code}
            ```
            
            Please identify:
            1. Syntax errors
            2. Logic errors
            3. Potential runtime errors
            4. Security vulnerabilities
            5. Performance issues
            
            For each issue found, provide:
            - Type of issue
            - Line number (if identifiable)
            - Description
            - Severity (high/medium/low)
            
            Format as JSON array with objects containing: type, line, description, severity
            """
            
            response = await self._call_openai_api(prompt, max_tokens=800)
            
            # Try to parse JSON response
            try:
                bugs = json.loads(response)
                return bugs if isinstance(bugs, list) else []
            except json.JSONDecodeError:
                # Fallback to text parsing
                return self._parse_bug_text_response(response)
            
        except Exception as e:
            logger.error(f"Bug detection failed: {e}")
            return []
    
    async def _check_rate_limit(self):
        """Simple rate limiting to avoid hitting OpenAI limits"""
        current_time = time.time()
        
        # Reset counter every minute
        if current_time - self.last_request_time > 60:
            self.request_count = 0
            self.last_request_time = current_time
        
        # Limit to 20 requests per minute
        if self.request_count >= 20:
            wait_time = 60 - (current_time - self.last_request_time)
            if wait_time > 0:
                logger.info(f"Rate limiting: waiting {wait_time:.1f} seconds")
                await asyncio.sleep(wait_time)
                self.request_count = 0
                self.last_request_time = time.time()
        
        self.request_count += 1
    
    async def _call_openai_api(self, prompt: str, max_tokens: int = None) -> str:
        """
        Make API call to OpenAI
        
        Args:
            prompt: The prompt to send
            max_tokens: Maximum tokens in response
            
        Returns:
            API response text
        """
        try:
            if max_tokens is None:
                max_tokens = settings.openai_max_tokens
            
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=settings.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert code analyst and programming mentor. Provide clear, accurate, and helpful analysis."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=settings.openai_temperature,
                timeout=30
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise
    
    def _create_analysis_prompt(self, code: str, language: str, context: Optional[str] = None) -> str:
        """Create comprehensive analysis prompt"""
        context_text = f"\nContext: {context}" if context else ""
        
        return f"""
        Please analyze this {language} code and provide insights:
        {context_text}
        
        ```{language}
        {code}
        ```
        
        Please provide analysis in the following areas:
        1. Code Quality: Overall assessment of code quality and craftsmanship
        2. Best Practices: Adherence to {language} best practices and conventions
        3. Performance: Potential performance optimizations or concerns
        4. Maintainability: How easy the code is to understand and maintain
        5. Security: Any security considerations or vulnerabilities
        6. Learning Opportunities: Concepts this code demonstrates well or areas for improvement
        
        For each area, provide:
        - A confidence score (0.0-1.0)
        - Specific observations
        - Actionable recommendations
        
        Keep responses concise but informative.
        """
    
    def _parse_ai_response(self, response: str, language: str) -> List[AIInsight]:
        """Parse OpenAI response into structured insights"""
        insights = []
        
        try:
            # Split response into sections
            sections = response.split('\n\n')
            
            for section in sections:
                if not section.strip():
                    continue
                
                lines = section.strip().split('\n')
                if len(lines) < 2:
                    continue
                
                # Extract title and content
                title_line = lines[0].strip()
                content_lines = lines[1:]
                
                # Determine insight type
                insight_type = "general"
                if "quality" in title_line.lower():
                    insight_type = "quality"
                elif "performance" in title_line.lower():
                    insight_type = "performance"
                elif "security" in title_line.lower():
                    insight_type = "security"
                elif "best" in title_line.lower() or "practice" in title_line.lower():
                    insight_type = "best_practice"
                elif "learning" in title_line.lower():
                    insight_type = "learning"
                
                # Extract confidence score (if mentioned)
                confidence = 0.8  # Default confidence
                content = '\n'.join(content_lines)
                
                # Look for confidence mentions
                confidence_match = re.search(r'confidence[:\s]+(\d+\.?\d*)', content, re.IGNORECASE)
                if confidence_match:
                    confidence = min(1.0, float(confidence_match.group(1)))
                
                insights.append(AIInsight(
                    type=insight_type,
                    confidence=confidence,
                    message=title_line,
                    explanation=content,
                    learning_resources=[]
                ))
        
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            # Fallback: create a single general insight
            insights.append(AIInsight(
                type="general",
                confidence=0.5,
                message="AI Analysis Completed",
                explanation=response[:500] + "..." if len(response) > 500 else response,
                learning_resources=[]
            ))
        
        return insights
    
    def _parse_bug_text_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse text response for bug information"""
        bugs = []
        
        # Simple text parsing for bug information
        lines = response.split('\n')
        current_bug = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_bug:
                    bugs.append(current_bug)
                    current_bug = {}
                continue
            
            # Look for severity indicators
            if any(word in line.lower() for word in ['high', 'medium', 'low', 'critical']):
                for severity in ['critical', 'high', 'medium', 'low']:
                    if severity in line.lower():
                        current_bug['severity'] = severity
                        break
            
            # Look for line numbers
            line_match = re.search(r'line\s+(\d+)', line, re.IGNORECASE)
            if line_match:
                current_bug['line'] = int(line_match.group(1))
            
            # Store description
            if 'description' not in current_bug and len(line) > 20:
                current_bug['description'] = line
                current_bug['type'] = 'potential_issue'
        
        if current_bug:
            bugs.append(current_bug)
        
        return bugs
    
    def _create_ai_result(self, insights: List[AIInsight]) -> Any:
        """Create AI analysis result object"""
        class AIResult:
            def __init__(self, insights):
                self.insights = insights
        
        return AIResult(insights)
    
    def _create_empty_result(self) -> Any:
        """Create empty result when AI is not available"""
        class EmptyResult:
            def __init__(self):
                self.insights = []
        
        return EmptyResult()

# Import regex for parsing
import re