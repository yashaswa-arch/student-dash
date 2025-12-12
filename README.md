# 🚀 SAP — Skill Analytics Platform

AI-powered skill analytics platform for coding practice and interview prep. Track problems, get code feedback, improve skills.

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

## 🎥 Video Lectures Module

The Video Lectures module provides a complete infrastructure for managing video-based learning content with interactive quizzes and presence tracking.

### Features

- **Video Management**: Organize videos by Topic → Series → Video hierarchy
- **Metadata Extraction**: Automatically extract video metadata (thumbnail, duration) from YouTube/Vimeo URLs
- **Auto-Timestamps**: Generate suggested quiz timestamps based on video duration
- **Interactive Quizzes**: Embed quizzes at specific timestamps with multiple-choice questions
- **Presence Tracking**: Track user engagement using watch time and quiz performance
- **Admin UI**: Full-featured admin interface for adding and managing video content

### Database Models

- **Topic**: Top-level categories (e.g., "Data Structures", "Algorithms")
- **Series**: Collections of videos under a topic (e.g., "Binary Trees", "Dynamic Programming")
- **Video**: Individual video lectures with metadata (src, provider, thumbnail, durationSeconds, segmentTimestamps)
- **VideoQuiz**: Quizzes associated with video segments (correctIndex stored server-side)
- **QuizAttempt**: Records of user quiz attempts
- **PresenceSummary**: Tracks user engagement (watch time, quiz accuracy, presence score)

### API Endpoints

#### Public Endpoints

- `GET /api/video-lectures/:videoId` - Get video metadata (includes segmentTimestamps)
- `GET /api/video-lectures/quizzes/:videoId` - Get published quizzes for a video (correctIndex omitted)

#### Authenticated Endpoints

- `POST /api/video-lectures/quizzes/submit` - Submit quiz attempt
  - Body: `{ quizId, selectedIndex, videoTimestamp }`
  - Returns: `{ ok, isCorrect, summary }` (updates PresenceSummary automatically)

#### Admin Endpoints

**Topic CRUD:**
- `GET /api/video-lectures/topics` - List all topics
- `POST /api/video-lectures/topics` - Create topic
- `PUT /api/video-lectures/topics/:id` - Update topic
- `DELETE /api/video-lectures/topics/:id` - Delete topic

**Series CRUD:**
- `GET /api/video-lectures/series?topic=:topicId` - List series (optionally filtered by topic)
- `POST /api/video-lectures/series` - Create series
- `PUT /api/video-lectures/series/:id` - Update series
- `DELETE /api/video-lectures/series/:id` - Delete series

**Video CRUD:**
- `GET /api/video-lectures/videos?series=:seriesId` - List videos (optionally filtered by series)
- `POST /api/video-lectures/videos` - Create video
- `PUT /api/video-lectures/videos/:id` - Update video
- `DELETE /api/video-lectures/videos/:id` - Delete video
- `POST /api/video-lectures/videos/:id/timestamps` - Set segment timestamps
  - Body: `{ segmentTimestamps: [60, 120, 300] }`

**Utility Endpoints:**
- `POST /api/video-lectures/extract-metadata` - Extract metadata from video URL
  - Body: `{ url: "https://youtube.com/watch?v=..." }`
  - Returns: `{ videoId, provider, thumbnail, durationSeconds }`
  - Uses YouTube Data API if `YOUTUBE_API_KEY` is set in environment
- `POST /api/video-lectures/:videoId/auto-timestamps` - Generate suggested timestamps
  - Body: `{ numQuizzes: 3, startOffset: 60, endOffset: 60 }`
  - Returns: `{ timestamps: [120, 240, 360], durationSeconds, ... }`
  - Requires video to have `durationSeconds` set

### Usage

#### Adding a Video (Admin)

1. Navigate to `/admin/video-lectures/add`
2. Paste video URL (YouTube/Vimeo supported)
3. Click "Extract Metadata" to fetch thumbnail, duration, and video ID
4. Enter video title and description
5. Select Topic and Series
6. Click "Auto-generate Timestamps" to create evenly-spaced quiz timestamps
7. Manually add/edit timestamps as needed
8. Click "Save Video" to create the video record

#### Creating Quizzes

Quizzes are created separately (via admin API or direct database insertion) and linked to videos via the `video` field and `timestamp` field. The `correctIndex` field stores the 0-based index of the correct answer and is never sent to clients.

#### Presence Score Calculation

The presence score uses the finalized formula:
```
presenceScore = (watchPercentage * 0.5) + (quizAccuracy * 0.5)
```

Where:
- `watchPercentage`: Percentage of video watched (0-100)
- `quizAccuracy`: (quizzesCorrect / quizzesAnswered) * 100 (0 if no quizzes answered)

### Frontend Components

- **AdminVideoAdd** (`/admin/video-lectures/add`): Full-featured admin interface for adding videos
  - URL paste and metadata extraction
  - Thumbnail preview
  - Title/description inputs
  - Topic/Series selectors
  - Auto-generate timestamps button
  - Editable timestamps grid
  - Save functionality

### Environment Variables

Optional (for enhanced metadata extraction):
- `YOUTUBE_API_KEY`: YouTube Data API v3 key for fetching video duration and metadata

## 📁 Project Structure

```
skill-analytics-platform/
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
