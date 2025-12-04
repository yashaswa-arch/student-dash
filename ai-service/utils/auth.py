"""
Authentication utilities for AI Code Intelligence Service
"""

import jwt
from fastapi import HTTPException, status
from typing import Dict, Any
import logging
from datetime import datetime, timedelta
from utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class AuthenticationError(Exception):
    """Custom authentication error"""
    pass

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token and return user data
    
    Args:
        token: JWT token string
        
    Returns:
        Dict containing user data
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=["HS256"]
        )
        
        # Check if token is expired
        exp = payload.get('exp')
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
            raise AuthenticationError("Token has expired")
        
        # Validate required fields
        required_fields = ['user_id', 'email', 'role']
        for field in required_fields:
            if field not in payload:
                raise AuthenticationError(f"Missing required field: {field}")
        
        logger.debug(f"Token verified for user: {payload.get('user_id')}")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Expired token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token provided: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except AuthenticationError as e:
        logger.warning(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )

def create_token(user_data: Dict[str, Any], expires_in_hours: int = 24) -> str:
    """
    Create JWT token for user
    
    Args:
        user_data: User information to encode
        expires_in_hours: Token expiration time in hours
        
    Returns:
        JWT token string
    """
    try:
        # Set expiration time
        expiration = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        # Create payload
        payload = {
            **user_data,
            'exp': expiration,
            'iat': datetime.utcnow(),
            'iss': 'ai-code-intelligence-service'
        }
        
        # Generate token
        token = jwt.encode(
            payload,
            settings.jwt_secret,
            algorithm="HS256"
        )
        
        logger.debug(f"Token created for user: {user_data.get('user_id')}")
        
        return token
        
    except Exception as e:
        logger.error(f"Failed to create token: {e}")
        raise AuthenticationError(f"Failed to create token: {e}")

def check_permission(user_data: Dict[str, Any], required_role: str = None, required_permissions: list = None) -> bool:
    """
    Check if user has required permissions
    
    Args:
        user_data: User data from token
        required_role: Required role (admin, instructor, student)
        required_permissions: List of required permissions
        
    Returns:
        True if user has permissions, False otherwise
    """
    try:
        user_role = user_data.get('role', '').lower()
        
        # Admin has all permissions
        if user_role == 'admin':
            return True
        
        # Check specific role requirement
        if required_role and user_role != required_role.lower():
            return False
        
        # Check specific permissions (if implemented in your system)
        if required_permissions:
            user_permissions = user_data.get('permissions', [])
            for permission in required_permissions:
                if permission not in user_permissions:
                    return False
        
        return True
        
    except Exception as e:
        logger.error(f"Permission check failed: {e}")
        return False

def get_user_context(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract relevant user context for AI analysis
    
    Args:
        user_data: User data from token
        
    Returns:
        User context dictionary
    """
    return {
        'user_id': user_data.get('user_id'),
        'role': user_data.get('role'),
        'skill_level': user_data.get('skill_level', 'beginner'),
        'preferred_languages': user_data.get('preferred_languages', []),
        'learning_goals': user_data.get('learning_goals', [])
    }