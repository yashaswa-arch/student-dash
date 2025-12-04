# AI Code Intelligence Service

A powerful FastAPI microservice that provides AI-powered code analysis, quality scoring, bug detection, and personalized learning recommendations for the Student Placement Training Platform.

## 🚀 Features

### Core Analysis
- **Static Code Analysis**: Comprehensive analysis using AST parsing and pattern detection
- **Quality Scoring**: Intelligent code quality assessment (0-100 scale)
- **Issue Detection**: Identifies syntax errors, logic issues, and style violations
- **Performance Analysis**: Detects potential performance bottlenecks
- **Security Scanning**: Basic security vulnerability detection

### AI-Powered Intelligence
- **OpenAI Integration**: Advanced code analysis using GPT models
- **Code Explanations**: Natural language explanations of code functionality
- **Bug Detection**: AI-powered identification of potential bugs and issues
- **Improvement Suggestions**: Contextual recommendations for code enhancement
- **Learning Insights**: Educational insights about programming concepts

### Personalized Learning
- **Skill Assessment**: Tracks user coding skills and progress
- **Learning Recommendations**: Personalized suggestions based on code quality and patterns
- **Progress Tracking**: Monitors improvement over time
- **Resource Suggestions**: Curated learning materials and tutorials

### Language Support
- **Primary Languages**: Python, JavaScript, TypeScript, Java
- **Additional Support**: C/C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin
- **Extensible Architecture**: Easy to add new language analyzers

## 🛠 Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager
- OpenAI API key (optional, for AI features)

### Quick Start

#### Windows
```bash
# Run the startup script
start.bat
```

#### Linux/macOS
```bash
# Make script executable and run
chmod +x start.sh
./start.sh
```

#### Manual Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the service
python start.py
```

## ⚙️ Configuration

Create a `.env` file with your configuration:

```env
# Service Configuration
AI_SERVICE_HOST=127.0.0.1
AI_SERVICE_PORT=8001
LOG_LEVEL=INFO
ENVIRONMENT=development

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.3

# Backend Integration
BACKEND_URL=http://localhost:5000
JWT_SECRET=your-jwt-secret-key-here

# Feature Flags
ENABLE_OPENAI_ANALYSIS=true
ENABLE_LOCAL_ANALYSIS=true
ENABLE_LEARNING_RECOMMENDATIONS=true

# Analysis Limits
MAX_CODE_LENGTH=10000
ANALYSIS_TIMEOUT_SECONDS=30
```

## 📡 API Endpoints

### Health & Status
- `GET /` - Service status and features
- `GET /health` - Detailed health check
- `GET /languages` - Supported programming languages

### Code Analysis
- `POST /analyze` - Comprehensive code analysis
- `POST /quick-analysis` - Fast quality assessment

### AI Features
- `POST /explain` - Get AI explanation of code
- `POST /suggest-improvements` - AI improvement suggestions
- `POST /detect-bugs` - AI-powered bug detection

### Learning & Recommendations
- `GET /recommendations/{user_id}` - Get user recommendations
- `POST /update-progress` - Update learning progress

## 🔧 Usage Examples

### Basic Code Analysis
```python
import requests

response = requests.post('http://localhost:8001/analyze', 
    headers={'Authorization': 'Bearer YOUR_JWT_TOKEN'},
    json={
        'code': 'def hello_world():\n    print("Hello, World!")',
        'language': 'python',
        'include_suggestions': True,
        'include_ai_analysis': True,
        'include_recommendations': True
    }
)

result = response.json()
print(f"Quality Score: {result['code_quality']}")
print(f"Issues Found: {len(result['issues'])}")
```

### Quick Analysis
```python
response = requests.post('http://localhost:8001/quick-analysis',
    headers={'Authorization': 'Bearer YOUR_JWT_TOKEN'},
    json={
        'code': 'console.log("Hello World");',
        'language': 'javascript'
    }
)

result = response.json()
print(f"Quick Score: {result['quality_score']}")
```

## 🏗 Architecture

```
ai-service/
├── main.py                 # FastAPI application entry point
├── start.py               # Service startup script
├── requirements.txt       # Python dependencies
├── .env                  # Environment configuration
├── models/               # Pydantic data models
│   ├── analysis_models.py
│   └── __init__.py
├── services/            # Core business logic
│   ├── code_analyzer.py     # Static code analysis
│   ├── ai_intelligence.py   # OpenAI integration
│   ├── learning_recommendations.py
│   └── __init__.py
├── utils/              # Utility functions
│   ├── config.py          # Configuration management
│   ├── auth.py           # JWT authentication
│   └── __init__.py
└── README.md           # This file
```

## 🔒 Security

- **JWT Authentication**: All endpoints require valid JWT tokens
- **Rate Limiting**: Built-in rate limiting for OpenAI API calls
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Configurable CORS policies
- **Secure Defaults**: Secure configuration defaults

## 🧪 Testing

```bash
# Run tests (when implemented)
pytest tests/

# Test specific endpoint
curl -X POST "http://localhost:8001/analyze" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"Hello\")", "language": "python"}'
```

## 📊 Monitoring & Logging

- **Structured Logging**: JSON-formatted logs for analysis
- **Health Checks**: Built-in health monitoring endpoints
- **Performance Metrics**: Analysis timing and throughput metrics
- **Error Tracking**: Comprehensive error logging and reporting

## 🔄 Integration with Node.js Backend

The AI service integrates seamlessly with the main Node.js backend:

1. **Authentication**: Uses shared JWT tokens for user verification
2. **Communication**: RESTful API communication
3. **Data Flow**: Analysis results can be sent back to main backend
4. **User Context**: Maintains user progress and learning state

## 🚀 Deployment

### Development
```bash
python start.py
```

### Production
```bash
# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001

# Using Docker (when Dockerfile is created)
docker build -t ai-code-service .
docker run -p 8001:8001 ai-code-service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is part of the Student Placement Training Platform.

## 🆘 Support

For issues and questions:
1. Check the logs in `ai_service.log`
2. Verify your `.env` configuration
3. Ensure all dependencies are installed
4. Check OpenAI API key validity (if using AI features)

## 🔮 Future Enhancements

- [ ] Support for more programming languages
- [ ] Advanced code complexity metrics
- [ ] Integration with more AI models
- [ ] Real-time code analysis via WebSockets
- [ ] Code comparison and diff analysis
- [ ] Team collaboration features
- [ ] Advanced learning analytics
- [ ] Integration with popular IDEs