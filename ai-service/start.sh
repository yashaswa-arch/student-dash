#!/bin/bash
# AI Code Intelligence Service Startup Script for Unix/Linux/macOS

echo "🤖 AI Code Intelligence Service"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📚 Installing/updating dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo "⚠️ .env file not found - using default configuration"
fi

# Start the service
echo "🚀 Starting AI Code Intelligence Service..."
echo ""
python start.py