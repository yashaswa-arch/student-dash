# Student Dashboard - AI-Powered Learning Platform

A comprehensive student placement training and coding dashboard with AI-powered interview practice, real-time code execution, and progress analytics.

## 🚀 Features

- **AI-Powered Interview Practice** - Real-time speech analysis and feedback
- **Code Execution Engine** - Multi-language support with automated testing
- **Progress Analytics** - Comprehensive skill tracking and learning paths
- **Real-time Collaboration** - Live coding interviews and mentorship
- **Gamification** - Badges, leaderboards, and achievement system
- **Placement Management** - Job applications and company connections

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- Judge0 CE for code execution
- WebSocket for real-time features

**AI Services:**
- Speech-to-text analysis
- Video/facial recognition
- Code intelligence and plagiarism detection
- Personalized recommendations

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/student-dash.git
cd student-dash
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB and seed the database:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## 🗂️ Project Structure

```
project2/
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & validation
│   │   ├── config/       # Database config
│   │   └── seed/         # Sample data
│   ├── package.json
│   └── README.md
└── frontend/             # React frontend (coming soon)
```

## 🔗 API Endpoints

- **Authentication:** `/api/auth/*`
- **Users:** `/api/users/*`
- **Courses:** `/api/courses/*`
- **Coding Questions:** `/api/questions/*`
- **Interview Attempts:** `/api/attempts/*`
- **Transcripts:** `/api/transcripts/*`

## 🚧 Development Status

**Current Phase:** Backend API Development (70% complete)

**Completed:**
- ✅ User authentication and authorization
- ✅ Course and question management
- ✅ Interview attempt tracking
- ✅ Database schema and seeding

**In Progress:**
- 🔄 Code execution system integration
- 🔄 AI services integration
- 🔄 Real-time features
- 🔄 Frontend development

## 🤝 Contributing

This is an active development project. Contributions are welcome!

## 📄 License

MIT License

---

**Status:** 🚧 Under Active Development