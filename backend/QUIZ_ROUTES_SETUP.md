# Quiz Routes Setup Instructions

## Files Created

1. ✅ `backend/src/models/Quiz.js` - New Quiz model
2. ✅ `backend/src/routes/quizRoutes.js` - Quiz routes with Gemini integration

## Installation Steps

### 1. Install Required Dependencies

Run the following command in the `backend` directory:

```bash
cd backend
npm install youtube-transcript
```

**Note:** `node-fetch` is not needed as Node.js 18+ has native `fetch` support. The code uses the existing `@google/generative-ai` package which is already installed.

### 2. Environment Variables

Ensure these environment variables are set in your `.env` file:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
# OR use the existing GOOGLE_API_KEY (code supports both)
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Specify Gemini model (defaults to 'gemini-1.5-pro')
GEMINI_MODEL=gemini-1.5-pro
```

**Note:** The code will check for `GEMINI_API_KEY` first, then fall back to `GOOGLE_API_KEY` for compatibility with existing setup.

### 3. Mount Routes in server.js

Add this line to `backend/src/server.js` after line 101 (after the video-lectures route):

```javascript
app.use('/api/video-lectures', require('./routes/quizRoutes'));
```

**Full context** (around line 101-102):
```javascript
app.use('/api/video-lectures', videoLectureRoutes);
app.use('/api/video-lectures', require('./routes/quizRoutes'));  // <-- ADD THIS LINE
```

**Important:** The quiz routes are mounted at `/api/video-lectures` to match the existing API structure. The routes defined in `quizRoutes.js` are:
- `GET /api/video-lectures/quizzes/:videoId` - Get quizzes for a video
- `POST /api/video-lectures/quizzes/submit` - Submit quiz answer (requires auth)
- `POST /api/video-lectures/video/:id/generate-quizzes` - Generate quizzes using Gemini (requires auth)

## API Endpoints

### GET `/api/video-lectures/quizzes/:videoId`
- **Public endpoint** - Returns all quizzes for a video
- Accepts either YouTube videoId or MongoDB _id

### POST `/api/video-lectures/quizzes/submit`
- **Protected** - Requires authentication
- Body: `{ quizId, selectedIndex, videoTimestamp, responseTime?, attemptedSkip?, videoId? }`
- Returns: `{ success: true, data: { correct: boolean } }`

### POST `/api/video-lectures/video/:id/generate-quizzes`
- **Protected** - Requires authentication (admin recommended)
- Body: `{ numQuizzes?: 6, startOffset?: 30, endOffset?: 30, segments?: [...] }`
- Automatically fetches YouTube transcript if `youtube-transcript` is installed
- Generates MCQs using Gemini API
- Returns: `{ success: true, data: [generated quizzes] }`

## Notes

- The Quiz model is separate from the existing VideoQuiz model
- Transcript fetching is optional - if `youtube-transcript` is not installed, you can provide segments manually in the request body
- The Gemini integration uses the existing `@google/generative-ai` package
- All routes follow the existing codebase patterns (CommonJS, error handling, etc.)

