# Video Lectures Frontend Routes

This document describes the frontend routing and API integration for the Video Lectures feature.

## Routes

### 1. `/video-lectures` - VideoLectureList
**Component:** `VideoLectureList.jsx`  
**Purpose:** Main listing page showing all topics and series

**API Calls:**
- `GET /api/video-lectures/topics` - Fetches all topics (falls back gracefully if endpoint doesn't exist)
- `GET /api/video-lectures/series` - Fetches all series (optionally filtered by topic)

**Features:**
- Two-column layout: Topics (left) and Series cards (right)
- Topic filtering
- If topics API doesn't exist, derives topics from series data
- Each series card navigates to `/video-lectures/series/:seriesId`

**Test ID:** `card-video-lectures` (on dashboard card)

---

### 2. `/video-lectures/series/:seriesId` - SeriesVideos
**Component:** `SeriesVideos.jsx`  
**Purpose:** Displays all videos in a specific series

**API Calls:**
- `GET /api/video-lectures/series/:seriesId` - Fetches series metadata (with fallback to query param)
- `GET /api/video-lectures/videos?series=:seriesId` - Fetches videos in the series

**Features:**
- Grid layout showing video thumbnails, titles, and durations
- "Start" button on each video navigates to `/video-lectures/video/:videoId`
- Back button to return to lecture list

**Test ID:** `video-item-{videoId}` (on each video card)

---

### 3. `/video-lectures/video/:videoId` - VideoPage
**Component:** `VideoPage.jsx`  
**Purpose:** Video player page with presence summary

**API Calls:**
- `GET /api/video-lectures/:videoId` - Fetches video metadata
- Presence summary is updated from player component responses (no separate API call needed)

**Features:**
- Renders `VideoLecturePlayer` component
- Shows video title and "Pop-up quizzes enabled" subtitle
- Right sidebar displays presence summary (correct/incorrect/unanswered counts and score)
- Responsive: stacked on mobile, side-by-side on desktop

**Test ID:** `video-player-{videoId}` (on main player container)

---

## Component Dependencies

### VideoLecturePlayer
**Location:** `src/components/VideoLecturePlayer.jsx`  
**Props:** `videoId` (string)  
**API Calls:**
- `GET /api/video-lectures/:videoId` - Video metadata
- `GET /api/video-lectures/quizzes/:videoId` - Published quizzes (without correctIndex)
- `POST /api/video-lectures/quizzes/submit` - Submit quiz answers

### SmallUIHelpers
**Location:** `src/components/SmallUIHelpers.jsx`  
**Exports:**
- `Card` - Reusable card component
- `Loader` - Loading spinner
- `ErrorMessage` - Error display component

---

## Dashboard Integration

The Video Lectures feature is accessible from the student dashboard:
- **Card Location:** Practice tab, 5th card in the grid
- **Card Title:** "Video Lectures"
- **Card Subtitle:** "Interactive lectures with timed pop-up quizzes"
- **Navigation:** Clicking the card navigates to `/video-lectures`
- **Test ID:** `card-video-lectures`

---

## Error Handling

All components implement graceful error handling:
- API failures show friendly error messages
- Missing endpoints return empty arrays/objects (degraded mode)
- Loading states displayed during data fetching
- Toast notifications for user feedback

---

## Responsive Design

- **Desktop (lg+):** Two-column layouts (topics/series, player/summary)
- **Tablet (md):** Adjusted grid columns
- **Mobile:** Stacked single-column layout

---

## Backend Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/video-lectures/topics` | GET | List topics | No (public) |
| `/api/video-lectures/series` | GET | List series | No (public) |
| `/api/video-lectures/series/:id` | GET | Get series details | No (public) |
| `/api/video-lectures/videos` | GET | List videos (filtered by series) | No (public) |
| `/api/video-lectures/:videoId` | GET | Get video metadata | No (public) |
| `/api/video-lectures/quizzes/:videoId` | GET | Get published quizzes | No (public) |
| `/api/video-lectures/quizzes/submit` | POST | Submit quiz answer | Yes (auth) |

---

## Notes

- All routes are protected (require authentication via `ProtectedRoute`)
- Client-side routing only (no full page refreshes)
- `correctIndex` is never exposed to the frontend
- Presence summary updates automatically from player component responses

