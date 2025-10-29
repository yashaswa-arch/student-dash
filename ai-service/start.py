#!/usr/bin/env python3
"""
Start the AI Code Intelligence Service
"""

import os
import sys
import logging
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import after path setup
try:
    import uvicorn
    from main import app
    from utils.config import get_settings
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install dependencies: pip install -r requirements.txt")
    sys.exit(1)

def main():
    """Start the AI service"""
    try:
        # Load settings
        settings = get_settings()
        
        print("🤖 Starting AI Code Intelligence Service...")
        print(f"🌐 Host: {settings.ai_service_host}")
        print(f"🔌 Port: {settings.ai_service_port}")
        print(f"📊 Log Level: {settings.log_level}")
        print(f"🧠 OpenAI Enabled: {settings.enable_openai_analysis}")
        print("-" * 50)
        
        # Start the server
        uvicorn.run(
            "main:app",
            host=settings.ai_service_host,
            port=settings.ai_service_port,
            reload=True,
            log_level=settings.log_level.lower(),
            access_log=True
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()