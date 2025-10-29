@echo off
REM AI Code Intelligence Service Startup Script for Windows

echo 🤖 AI Code Intelligence Service
echo ================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
echo 📚 Installing/updating dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check environment file
if not exist ".env" (
    echo ⚠️ .env file not found - using default configuration
)

REM Start the service
echo 🚀 Starting AI Code Intelligence Service...
echo.
python start.py

pause