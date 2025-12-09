# 🚀 Student Dash - AI-Powered Coding Platform

AI-powered platform for coding practice and interview prep. Track problems, get code feedback, improve skills.

## ✨ Features

- **AI Code Review** – Analyze code for security issues, performance problems, and style improvements
- **Question Tracker** – Manage problems from LeetCode/HackerRank with test cases and notes
- **Aptitude Prep** – Topic-wise MCQ quizzes (Percentages, Profit & Loss, Time & Work) with detailed analytics
- **Progress Analytics** – Activity heatmaps, topic mastery, coding streaks, and performance charts
- **Multi-Language Support** – Java, Python, JavaScript, C++, Go, Rust, and more

## 🛠️ Tech Stack

**Frontend:** React + TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, MongoDB  
**AI:** Python, FastAPI, CodeBERT

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB

### Installation

```bash
# Clone the repository
git clone https://github.com/yashaswa-arch/student-dash.git
cd student-dash

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure MongoDB URI and JWT secret
npm start             # Runs on port 5000

# AI Service setup
cd ../ai-service
pip install -r requirements.txt
python simple_main.py # Runs on port 8001

# Frontend setup
cd ../frontend
npm install
npm run dev           # Runs on port 3000
```

## 📊 API Endpoints

**Auth:** `POST /api/auth/login`, `POST /api/auth/signup`  
**Questions:** `GET /api/questions`, `POST /api/questions`, `POST /api/questions/:id/submit`  
**AI:** `POST /api/ai/analyze`

## 📁 Project Structure

```
student-dash/
├── frontend/          # React TypeScript app
├── backend/           # Express API server
│   ├── src/models/   # MongoDB schemas
│   ├── src/routes/   # API endpoints
│   └── src/services/ # Business logic
└── ai-service/        # Python ML service
```

## 👥 Contributors

We would like to thank all the contributors who have helped make this project possible:

- **[@TahaRang121](https://github.com/TahaRang121)** - Core Contributor
- **[@UdayBhargav](https://github.com/UdayBhargav)** - Core Contributor  
- **[@Yogita15082006](https://github.com/Yogita15082006)** - Core Contributor
- **[@Ashraf114](https://github.com/Ashraf114)** - External Mentor

## 📄 License

MIT License

---

Built by [@yashaswa-arch](https://github.com/yashaswa-arch) | Last updated: November 2025
