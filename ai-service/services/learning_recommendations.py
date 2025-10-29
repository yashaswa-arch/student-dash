"""
Learning Recommendations Service
Personalized learning recommendations based on code analysis
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio

from models.analysis_models import LearningRecommendation, SkillLevelEnum
from utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class LearningRecommendations:
    """Service for generating personalized learning recommendations"""
    
    def __init__(self):
        self.recommendation_cache = {}
        self.user_progress_cache = {}
        
        # Learning resource database
        self.learning_resources = {
            'python': {
                'beginner': [
                    {
                        'title': 'Python Basics: Variables and Data Types',
                        'description': 'Learn about Python variables, strings, numbers, and basic data types',
                        'type': 'tutorial',
                        'estimated_time': '2 hours',
                        'skills': ['variables', 'data_types', 'syntax'],
                        'resources': [
                            {'type': 'tutorial', 'url': 'https://python.org/tutorial/'},
                            {'type': 'practice', 'url': 'https://codecademy.com/python'}
                        ]
                    },
                    {
                        'title': 'Functions and Code Organization',
                        'description': 'Learn to write clean, reusable functions and organize your code',
                        'type': 'course',
                        'estimated_time': '3 hours',
                        'skills': ['functions', 'parameters', 'return_values', 'code_organization'],
                        'resources': [
                            {'type': 'course', 'url': 'https://example.com/python-functions'},
                            {'type': 'practice', 'url': 'https://example.com/python-exercises'}
                        ]
                    }
                ],
                'intermediate': [
                    {
                        'title': 'Object-Oriented Programming in Python',
                        'description': 'Master classes, objects, inheritance, and polymorphism',
                        'type': 'course',
                        'estimated_time': '5 hours',
                        'skills': ['classes', 'objects', 'inheritance', 'encapsulation'],
                        'resources': [
                            {'type': 'course', 'url': 'https://example.com/python-oop'},
                            {'type': 'documentation', 'url': 'https://docs.python.org/3/tutorial/classes.html'}
                        ]
                    },
                    {
                        'title': 'Error Handling and Debugging',
                        'description': 'Learn proper exception handling and debugging techniques',
                        'type': 'tutorial',
                        'estimated_time': '2 hours',
                        'skills': ['exceptions', 'try_catch', 'debugging'],
                        'resources': [
                            {'type': 'tutorial', 'url': 'https://example.com/python-errors'},
                            {'type': 'practice', 'url': 'https://example.com/debug-exercises'}
                        ]
                    }
                ]
            },
            'javascript': {
                'beginner': [
                    {
                        'title': 'JavaScript Fundamentals',
                        'description': 'Learn variables, functions, and basic JavaScript syntax',
                        'type': 'course',
                        'estimated_time': '4 hours',
                        'skills': ['variables', 'functions', 'loops', 'conditionals'],
                        'resources': [
                            {'type': 'course', 'url': 'https://javascript.info/'},
                            {'type': 'practice', 'url': 'https://freecodecamp.org/javascript'}
                        ]
                    },
                    {
                        'title': 'DOM Manipulation Basics',
                        'description': 'Learn to interact with web pages using JavaScript',
                        'type': 'tutorial',
                        'estimated_time': '3 hours',
                        'skills': ['dom', 'events', 'selectors'],
                        'resources': [
                            {'type': 'tutorial', 'url': 'https://example.com/dom-tutorial'},
                            {'type': 'practice', 'url': 'https://example.com/dom-exercises'}
                        ]
                    }
                ],
                'intermediate': [
                    {
                        'title': 'Asynchronous JavaScript',
                        'description': 'Master promises, async/await, and asynchronous programming',
                        'type': 'course',
                        'estimated_time': '4 hours',
                        'skills': ['promises', 'async_await', 'callbacks'],
                        'resources': [
                            {'type': 'course', 'url': 'https://example.com/async-js'},
                            {'type': 'documentation', 'url': 'https://developer.mozilla.org/docs/Web/JavaScript/Guide'}
                        ]
                    }
                ]
            },
            'java': {
                'beginner': [
                    {
                        'title': 'Java Basics and OOP',
                        'description': 'Learn Java syntax, classes, and object-oriented programming',
                        'type': 'course',
                        'estimated_time': '6 hours',
                        'skills': ['syntax', 'classes', 'objects', 'inheritance'],
                        'resources': [
                            {'type': 'course', 'url': 'https://oracle.com/java/tutorials/'},
                            {'type': 'practice', 'url': 'https://codingbat.com/java'}
                        ]
                    }
                ]
            }
        }
        
        # Common coding patterns and their recommendations
        self.pattern_recommendations = {
            'missing_error_handling': {
                'title': 'Error Handling Best Practices',
                'description': 'Learn proper exception handling and error management',
                'priority': 8,
                'skills': ['error_handling', 'exceptions', 'defensive_programming']
            },
            'long_functions': {
                'title': 'Code Organization and Refactoring',
                'description': 'Learn to break down complex functions into smaller, manageable pieces',
                'priority': 7,
                'skills': ['refactoring', 'code_organization', 'single_responsibility']
            },
            'magic_numbers': {
                'title': 'Clean Code Principles',
                'description': 'Learn about code readability and maintaining clean, understandable code',
                'priority': 6,
                'skills': ['clean_code', 'constants', 'readability']
            },
            'missing_documentation': {
                'title': 'Code Documentation',
                'description': 'Learn to write effective comments and documentation',
                'priority': 5,
                'skills': ['documentation', 'comments', 'maintainability']
            }
        }
    
    async def get_recommendations(self, user_id: str, code_quality: float, 
                                language: str, skill_level: str = "beginner") -> List[LearningRecommendation]:
        """
        Get personalized learning recommendations based on code analysis
        
        Args:
            user_id: User identifier
            code_quality: Code quality score (0-100)
            language: Programming language
            skill_level: User's skill level
            
        Returns:
            List of learning recommendations
        """
        try:
            recommendations = []
            
            # Get language-specific recommendations
            lang_recommendations = self._get_language_recommendations(language, skill_level)
            recommendations.extend(lang_recommendations)
            
            # Get quality-based recommendations
            quality_recommendations = self._get_quality_based_recommendations(code_quality, language)
            recommendations.extend(quality_recommendations)
            
            # Get personalized recommendations based on user history
            personal_recommendations = await self._get_personalized_recommendations(user_id, language)
            recommendations.extend(personal_recommendations)
            
            # Sort by priority and limit to top 5
            recommendations = sorted(recommendations, key=lambda x: x.priority, reverse=True)[:5]
            
            logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            return []
    
    async def get_user_recommendations(self, user_id: str) -> List[LearningRecommendation]:
        """
        Get all recommendations for a specific user
        
        Args:
            user_id: User identifier
            
        Returns:
            List of user's learning recommendations
        """
        try:
            # This would typically fetch from a database
            # For now, return cached recommendations or generate default ones
            
            if user_id in self.recommendation_cache:
                cached_data = self.recommendation_cache[user_id]
                if self._is_cache_valid(cached_data['timestamp']):
                    return cached_data['recommendations']
            
            # Generate default recommendations
            default_recommendations = await self._generate_default_recommendations(user_id)
            
            # Cache the results
            self.recommendation_cache[user_id] = {
                'recommendations': default_recommendations,
                'timestamp': datetime.now()
            }
            
            return default_recommendations
            
        except Exception as e:
            logger.error(f"Failed to get user recommendations: {e}")
            return []
    
    async def update_user_progress(self, user_id: str, completed_skill: str, 
                                 language: str, performance_score: float):
        """
        Update user's learning progress
        
        Args:
            user_id: User identifier
            completed_skill: Skill that was practiced/completed
            language: Programming language
            performance_score: Score achieved (0-100)
        """
        try:
            if user_id not in self.user_progress_cache:
                self.user_progress_cache[user_id] = {
                    'skills': {},
                    'languages': {},
                    'last_updated': datetime.now()
                }
            
            progress = self.user_progress_cache[user_id]
            
            # Update skill progress
            if completed_skill not in progress['skills']:
                progress['skills'][completed_skill] = []
            
            progress['skills'][completed_skill].append({
                'score': performance_score,
                'timestamp': datetime.now(),
                'language': language
            })
            
            # Update language progress
            if language not in progress['languages']:
                progress['languages'][language] = []
            
            progress['languages'][language].append({
                'skill': completed_skill,
                'score': performance_score,
                'timestamp': datetime.now()
            })
            
            progress['last_updated'] = datetime.now()
            
            logger.info(f"Updated progress for user {user_id}: {completed_skill} in {language}")
            
        except Exception as e:
            logger.error(f"Failed to update user progress: {e}")
    
    def _get_language_recommendations(self, language: str, skill_level: str) -> List[LearningRecommendation]:
        """Get recommendations based on language and skill level"""
        recommendations = []
        
        lang_resources = self.learning_resources.get(language.lower(), {})
        level_resources = lang_resources.get(skill_level.lower(), [])
        
        for i, resource in enumerate(level_resources[:3]):  # Limit to 3 per language/level
            recommendation = LearningRecommendation(
                title=resource['title'],
                description=resource['description'],
                type=resource['type'],
                difficulty=SkillLevelEnum(skill_level.lower()),
                estimated_time=resource['estimated_time'],
                priority=8 - i,  # Higher priority for first items
                resources=resource['resources'],
                skills_improved=resource['skills']
            )
            recommendations.append(recommendation)
        
        return recommendations
    
    def _get_quality_based_recommendations(self, quality_score: float, language: str) -> List[LearningRecommendation]:
        """Get recommendations based on code quality issues"""
        recommendations = []
        
        if quality_score < 50:
            # Low quality - focus on fundamentals
            recommendations.append(LearningRecommendation(
                title=f"{language.title()} Fundamentals Review",
                description="Review basic concepts and syntax to improve code quality",
                type="course",
                difficulty=SkillLevelEnum.BEGINNER,
                estimated_time="3-4 hours",
                priority=9,
                resources=[
                    {"type": "tutorial", "url": f"https://example.com/{language}-basics"},
                    {"type": "practice", "url": f"https://example.com/{language}-exercises"}
                ],
                skills_improved=["syntax", "best_practices", "code_quality"]
            ))
        
        elif quality_score < 70:
            # Medium quality - focus on best practices
            recommendations.append(LearningRecommendation(
                title=f"{language.title()} Best Practices",
                description="Learn industry best practices and clean code principles",
                type="tutorial",
                difficulty=SkillLevelEnum.INTERMEDIATE,
                estimated_time="2-3 hours",
                priority=7,
                resources=[
                    {"type": "tutorial", "url": f"https://example.com/{language}-best-practices"},
                    {"type": "documentation", "url": f"https://example.com/{language}-style-guide"}
                ],
                skills_improved=["best_practices", "clean_code", "maintainability"]
            ))
        
        else:
            # High quality - focus on advanced topics
            recommendations.append(LearningRecommendation(
                title=f"Advanced {language.title()} Patterns",
                description="Explore advanced programming patterns and optimization techniques",
                type="course",
                difficulty=SkillLevelEnum.ADVANCED,
                estimated_time="4-6 hours",
                priority=6,
                resources=[
                    {"type": "course", "url": f"https://example.com/{language}-advanced"},
                    {"type": "practice", "url": f"https://example.com/{language}-challenges"}
                ],
                skills_improved=["design_patterns", "optimization", "architecture"]
            ))
        
        return recommendations
    
    async def _get_personalized_recommendations(self, user_id: str, language: str) -> List[LearningRecommendation]:
        """Get personalized recommendations based on user history"""
        recommendations = []
        
        try:
            # Get user progress
            progress = self.user_progress_cache.get(user_id, {})
            
            # Analyze weak areas
            weak_skills = self._identify_weak_skills(progress, language)
            
            # Generate recommendations for weak skills
            for skill in weak_skills[:2]:  # Limit to 2 personalized recommendations
                recommendation = self._create_skill_recommendation(skill, language)
                if recommendation:
                    recommendations.append(recommendation)
            
        except Exception as e:
            logger.error(f"Failed to get personalized recommendations: {e}")
        
        return recommendations
    
    def _identify_weak_skills(self, progress: Dict[str, Any], language: str) -> List[str]:
        """Identify skills that need improvement based on user progress"""
        weak_skills = []
        
        skills_data = progress.get('skills', {})
        
        for skill, attempts in skills_data.items():
            if not attempts:
                continue
            
            # Calculate average score for this skill
            recent_attempts = attempts[-5:]  # Last 5 attempts
            avg_score = sum(attempt['score'] for attempt in recent_attempts) / len(recent_attempts)
            
            # Consider it weak if average score is below 70
            if avg_score < 70:
                weak_skills.append(skill)
        
        # Also add common weak areas
        common_weak_areas = ['error_handling', 'code_organization', 'documentation']
        for area in common_weak_areas:
            if area not in skills_data and area not in weak_skills:
                weak_skills.append(area)
        
        return weak_skills
    
    def _create_skill_recommendation(self, skill: str, language: str) -> Optional[LearningRecommendation]:
        """Create a recommendation for a specific skill"""
        
        skill_templates = {
            'error_handling': {
                'title': f'Error Handling in {language.title()}',
                'description': 'Master exception handling and defensive programming techniques',
                'type': 'tutorial',
                'estimated_time': '2 hours',
                'skills': ['error_handling', 'exceptions', 'debugging']
            },
            'code_organization': {
                'title': f'Code Organization and Structure',
                'description': 'Learn to organize code into clean, maintainable modules',
                'type': 'course',
                'estimated_time': '3 hours',
                'skills': ['code_organization', 'modules', 'structure']
            },
            'documentation': {
                'title': 'Writing Effective Code Documentation',
                'description': 'Learn to write clear comments and documentation',
                'type': 'tutorial',
                'estimated_time': '1 hour',
                'skills': ['documentation', 'comments', 'readability']
            }
        }
        
        template = skill_templates.get(skill)
        if not template:
            return None
        
        return LearningRecommendation(
            title=template['title'],
            description=template['description'],
            type=template['type'],
            difficulty=SkillLevelEnum.INTERMEDIATE,
            estimated_time=template['estimated_time'],
            priority=6,
            resources=[
                {"type": "tutorial", "url": f"https://example.com/{skill}-{language}"},
                {"type": "practice", "url": f"https://example.com/{skill}-exercises"}
            ],
            skills_improved=template['skills']
        )
    
    async def _generate_default_recommendations(self, user_id: str) -> List[LearningRecommendation]:
        """Generate default recommendations for new users"""
        recommendations = []
        
        # Add some general programming recommendations
        default_recs = [
            {
                'title': 'Programming Fundamentals',
                'description': 'Master the core concepts of programming',
                'type': 'course',
                'difficulty': 'beginner',
                'estimated_time': '4 hours',
                'priority': 8,
                'skills': ['variables', 'functions', 'loops', 'conditionals']
            },
            {
                'title': 'Problem Solving Techniques',
                'description': 'Learn systematic approaches to solving programming problems',
                'type': 'tutorial',
                'difficulty': 'beginner',
                'estimated_time': '2 hours',
                'priority': 7,
                'skills': ['problem_solving', 'algorithms', 'debugging']
            },
            {
                'title': 'Code Quality and Best Practices',
                'description': 'Write clean, maintainable, and efficient code',
                'type': 'course',
                'difficulty': 'intermediate',
                'estimated_time': '3 hours',
                'priority': 6,
                'skills': ['clean_code', 'best_practices', 'refactoring']
            }
        ]
        
        for rec_data in default_recs:
            recommendation = LearningRecommendation(
                title=rec_data['title'],
                description=rec_data['description'],
                type=rec_data['type'],
                difficulty=SkillLevelEnum(rec_data['difficulty']),
                estimated_time=rec_data['estimated_time'],
                priority=rec_data['priority'],
                resources=[
                    {"type": "course", "url": "https://example.com/programming-fundamentals"},
                    {"type": "practice", "url": "https://example.com/coding-exercises"}
                ],
                skills_improved=rec_data['skills']
            )
            recommendations.append(recommendation)
        
        return recommendations
    
    def _is_cache_valid(self, timestamp: datetime, ttl_hours: int = 24) -> bool:
        """Check if cached data is still valid"""
        return datetime.now() - timestamp < timedelta(hours=ttl_hours)