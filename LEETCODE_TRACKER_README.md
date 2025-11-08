# 🚀 LeetCode Question Tracker - Complete System

## Overview
A simplified LeetCode practice tracking system that automatically fetches problems from URLs, analyzes your code with AI, and provides actionable feedback.

## ✨ Key Features

### 1. **URL-Based Problem Fetching**
- Paste any LeetCode problem URL
- Automatically scrapes title, description, difficulty
- No manual problem entry needed
- Works without LeetCode API key

### 2. **Smart Code Analysis**
AI analyzes your code and provides:
- ⏱️ **Time Complexity** (O(n), O(n²), etc.)
- 💾 **Space Complexity** (O(1), O(n), etc.)
- ❌ **Mistakes** (off-by-one, null refs, etc.)
- ⚠️ **Missing Edge Cases** (empty input, negatives, duplicates)
- ✅ **Improvements** (better data structures, optimizations)
- 📈 **Brute to Optimal Path** (step-by-step optimization guide)
- 💡 **Hints** (small hints without spoilers)

### 3. **Simple Workflow**
1. Paste LeetCode URL → Click "Fetch Problem"
2. Write your solution in Monaco Editor
3. Click "Analyze Code" → Get AI feedback
4. Add notes, set status (Attempted/Solved Optimal/Needs Improvement)
5. Save to database
6. View all saved questions with filters

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Monaco Editor
│   (Port 5173)   │  → LeetCodeTracker.tsx
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │  Node.js + Express + MongoDB
│   (Port 5000)   │  → /api/leetcode/*
└────────┬────────┘
         │
         ├─── LeetCode Scraper (cheerio + axios)
         │    → GraphQL API + HTML fallback
         │
         └─── AI Service (Python FastAPI)
              → /leetcode/analyze
              → Complexity estimation, mistake detection
```

---

## 📂 File Structure

### Backend Files
```
backend/src/
├── models/LeetCodeQuestion.js          # MongoDB schema
├── services/leetcodeScraper.js         # Problem fetching
├── routes/leetcodeRoutes.js            # REST API endpoints
└── server.js                           # Express app (modified)
```

### AI Service Files
```
ai-service/
├── leetcode_analyzer.py                # Code analysis logic
└── simple_main.py                      # FastAPI endpoints (modified)
```

### Frontend Files
```
frontend/src/
├── pages/LeetCodeTracker.tsx           # Main UI component
└── App.tsx                             # Routes (modified)
```

---

## 🔌 API Endpoints

### Backend Routes (`/api/leetcode/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/fetch` | Scrape LeetCode problem from URL |
| POST | `/analyze` | Get AI code analysis |
| POST | `/save` | Save question to database |
| GET | `/questions` | List all saved questions |
| GET | `/questions/:id` | Get single question |
| PUT | `/questions/:id` | Update question |
| DELETE | `/questions/:id` | Delete question |

### AI Service Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leetcode/analyze` | Analyze code and return feedback |

---

## 🗄️ Database Schema

```javascript
LeetCodeQuestion {
  user: ObjectId,              // User who saved question
  title: String,               // Problem title
  problemUrl: String,          // LeetCode URL (unique per user)
  difficulty: String,          // Easy/Medium/Hard
  description: String,         // Problem statement
  userCode: String,            // User's solution
  language: String,            // Programming language
  aiFeedback: {
    timeComplexity: String,
    spaceComplexity: String,
    mistakes: [String],
    missingEdgeCases: [String],
    improvements: [String],
    bruteToOptimalSuggestions: [String],
    hint: String
  },
  userNotes: String,           // Personal notes
  status: String,              // Attempted/Solved Optimal/Needs Improvement
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Quick Start

### 1. Start All Services
```powershell
.\START_LEETCODE_SYSTEM.ps1
```

This will start:
- ✅ MongoDB (port 27017)
- ✅ Backend (port 5000)
- ✅ AI Service (port 8001)
- ✅ Frontend (port 5173)

### 2. Access the Tracker
```
http://localhost:5173/leetcode-tracker
```

### 3. Test the System

#### Step 1: Fetch a Problem
1. Paste URL: `https://leetcode.com/problems/two-sum/`
2. Click "Fetch Problem"
3. ✅ See title, difficulty, description

#### Step 2: Write Code
```javascript
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
}
```

#### Step 3: Analyze
1. Click "Analyze Code"
2. ✅ Get feedback:
   - Time: O(n²)
   - Space: O(1)
   - Improvement: Use hashmap for O(n)
   - Hint: "Consider using a hashmap to store complements"

#### Step 4: Save
1. Add notes: "Brute force works, need to optimize"
2. Set status: "Needs Improvement"
3. Click "Save Question"

---

## 🔍 AI Analysis Details

### Time Complexity Estimation
```python
# Detects:
- Single loop → O(n)
- Nested loops → O(n²), O(n³)
- Recursion → O(2^n), O(n!)
- No loops → O(1)
```

### Space Complexity Estimation
```python
# Detects:
- Hashmaps/dictionaries → O(n)
- Arrays → O(n)
- Recursion depth → O(n)
- Constants only → O(1)
```

### Logical Mistake Detection
- Off-by-one errors (`i < n` vs `i <= n`)
- Missing return statements
- Null/undefined references
- Integer overflow warnings

### Edge Case Detection
- Empty input arrays
- Negative numbers
- Duplicate values
- Single element arrays
- Very large inputs

### Improvement Suggestions
- Replace nested loops with hashmap
- Use two-pointer technique for sorted arrays
- Binary search for O(log n)
- Dynamic programming for overlapping subproblems

### Brute to Optimal Path
Example for Two Sum:
1. Current: Nested loops O(n²)
2. Better: Sort + two pointers O(n log n)
3. Optimal: Hashmap O(n)

### Smart Hints
- **Two Sum** → "Think about storing complements"
- **Sorted Array** → "Consider two-pointer technique"
- **Tree** → "Try DFS or BFS traversal"
- **Subarray** → "Sliding window might help"

---

## 🎨 Frontend Features

### Components
1. **URL Input Box** - Paste LeetCode URLs
2. **Problem Display** - Title, difficulty badge, description
3. **Monaco Code Editor** - Syntax highlighting, 5 languages
4. **AI Feedback Panel** - Color-coded feedback sections
5. **Notes & Status** - Personal notes, status tracking
6. **Saved Questions List** - Filter by status, click to load

### UI Colors
- **Time/Space Complexity** - Purple/Blue badges
- **Mistakes** - Red text
- **Edge Cases** - Orange text
- **Improvements** - Green text
- **Optimization Path** - Blue steps
- **Hints** - Yellow highlight box

### Difficulty Badges
- 🟢 **Easy** - Green
- 🟡 **Medium** - Yellow
- 🔴 **Hard** - Red

### Status Badges
- 🔵 **Attempted** - Blue
- 🟢 **Solved Optimal** - Green
- 🟠 **Needs Improvement** - Orange

---

## 🛠️ Technical Details

### LeetCode Scraper Strategy
```javascript
// Primary: GraphQL API
POST https://leetcode.com/graphql
Query: titleSlug → title, difficulty, content

// Fallback: HTML scraping
- Parse meta tags (og:title, og:description)
- Extract from HTML structure
```

### Dependencies Installed
```json
Backend:
  - cheerio: HTML parsing
  - axios: HTTP requests

AI Service:
  - No new dependencies (uses existing FastAPI)
```

### Authentication
- All endpoints protected with JWT middleware
- Token stored in localStorage
- Format: `Authorization: Bearer <token>`

---

## 🧪 Testing Checklist

### Backend Testing
```bash
# Test scraper
POST http://localhost:5000/api/leetcode/fetch
{
  "url": "https://leetcode.com/problems/two-sum/"
}

# Test analyzer
POST http://localhost:5000/api/leetcode/analyze
{
  "code": "function twoSum(nums, target) {...}",
  "language": "javascript",
  "problemTitle": "Two Sum"
}

# Test save
POST http://localhost:5000/api/leetcode/save
{
  "title": "Two Sum",
  "problemUrl": "https://leetcode.com/problems/two-sum/",
  "userCode": "...",
  "language": "javascript"
}
```

### AI Service Testing
```bash
# Test analyzer directly
POST http://localhost:8001/leetcode/analyze
{
  "code": "...",
  "language": "python",
  "problemTitle": "Two Sum",
  "problemDescription": "..."
}
```

### Frontend Testing
1. Login to system
2. Navigate to `/leetcode-tracker`
3. Test fetch → analyze → save workflow
4. Verify saved questions list
5. Test status filters

---

## 🔒 Security Features

✅ JWT authentication on all endpoints
✅ User-scoped data (only see your questions)
✅ Input validation on URLs
✅ Error handling with meaningful messages
✅ CORS configured for localhost

---

## 📊 Database Indexes

```javascript
// For performance
{ user: 1, createdAt: -1 }    // List recent questions
{ user: 1, status: 1 }         // Filter by status
{ user: 1, problemUrl: 1 }     // Prevent duplicates
```

---

## 🚫 What This System Does NOT Do

❌ Execute code (no test case validation)
❌ Use LeetCode API key (scraping only)
❌ Provide full solutions (hints only)
❌ Auto-submit to LeetCode
❌ Track submission history timeline

---

## 🎯 Use Cases

### 1. Practice Tracking
- Save all attempted problems
- Track progress (Attempted → Solved Optimal)
- Review old solutions with AI feedback

### 2. Learning Resource
- Understand time/space complexity
- Learn common mistakes
- Get optimization strategies
- Practice with hints (no spoilers)

### 3. Interview Prep
- Track which problems to revisit
- Identify weak areas (complexity analysis)
- Practice explaining approach (notes section)

---

## 🔧 Troubleshooting

### Problem: Fetch fails
**Solution:** 
- Check URL format: `https://leetcode.com/problems/<slug>/`
- LeetCode may block requests (try VPN)
- Check browser console for CORS errors

### Problem: AI service returns generic feedback
**Solution:**
- AI service may be offline (check port 8001)
- Backend has fallback response
- Restart AI service: `python ai-service/simple_main.py`

### Problem: Code not saving
**Solution:**
- Check MongoDB is running
- Verify authentication token
- Check backend logs for errors

### Problem: Black screen on frontend
**Solution:**
- Check all imports are correct
- Verify Monaco Editor is installed: `npm install @monaco-editor/react`
- Check browser console for errors

---

## 📈 Future Enhancements (Optional)

- 📊 Analytics dashboard (problems solved per week)
- 🏷️ Tag problems by pattern (two-pointer, DP, etc.)
- 🔄 Compare multiple solutions side-by-side
- 📝 Export notes as markdown
- 🎯 Problem recommendations based on weak areas

---

## 📝 System Status

✅ **Backend**: Complete (4 new files, 1 modified)
✅ **AI Service**: Complete (1 new file, 1 modified)
✅ **Frontend**: Complete (1 new page, 1 modified)
✅ **Routes**: Registered in App.tsx
✅ **Dependencies**: Installed (cheerio, axios)
✅ **Startup Script**: Created

---

## 🎉 Ready to Use!

The LeetCode Question Tracker is fully built and ready to test. All services should be running.

**Access:** http://localhost:5173/leetcode-tracker

---

## 📞 Support

If you encounter issues:
1. Check all services are running (3 PowerShell windows)
2. Verify MongoDB is running: `Get-Process mongod`
3. Check backend logs for errors
4. Test AI service: `http://localhost:8001/docs`
5. Clear browser cache and reload

---

**Built with:** React, TypeScript, Node.js, Express, MongoDB, Python, FastAPI, Monaco Editor, TailwindCSS, Framer Motion
