# 🚀 Quick Start Guide - LeetCode Question Tracker

## ⚡ TL;DR

1. **Start services:** `.\START_LEETCODE_SYSTEM.ps1`
2. **Wait 15 seconds** for all servers to start
3. **Open:** http://localhost:5173/leetcode-tracker
4. **Test:** Paste `https://leetcode.com/problems/two-sum/` → Fetch → Code → Analyze → Save

---

## 📦 What Was Built

**NEW LeetCode Question Tracker** - URL-based system that:
- Auto-fetches problems from LeetCode URLs
- Analyzes code with AI (complexity, mistakes, hints)
- Saves to database with notes & status

---

## 🏗️ Architecture

```
Frontend (React) → Backend (Express) → LeetCode Scraper
                                    → AI Service (Python)
                                    → MongoDB
```

---

## 📁 New Files Created (7)

### Backend
1. `backend/src/models/LeetCodeQuestion.js` - MongoDB schema
2. `backend/src/services/leetcodeScraper.js` - Problem fetching
3. `backend/src/routes/leetcodeRoutes.js` - REST API

### AI Service
4. `ai-service/leetcode_analyzer.py` - Code analysis

### Frontend
5. `frontend/src/pages/LeetCodeTracker.tsx` - UI

### Scripts
6. `START_LEETCODE_SYSTEM.ps1` - Startup script
7. Documentation files

---

## 🎯 How to Use

### Step 1: Start Services
```powershell
.\START_LEETCODE_SYSTEM.ps1
```

Opens 3 windows:
- Backend (port 5000)
- AI Service (port 8001)
- Frontend (port 5173)

### Step 2: Access Tracker
```
http://localhost:5173/leetcode-tracker
```

### Step 3: Test Workflow
1. **Paste URL:** `https://leetcode.com/problems/two-sum/`
2. **Click:** "Fetch Problem"
3. **Write code** (any solution)
4. **Click:** "Analyze Code"
5. **See AI feedback:**
   - Time: O(n²)
   - Space: O(1)
   - Improvements: "Use hashmap for O(n)"
   - Hint: "Think about storing complements"
6. **Add notes & save**

---

## 🔍 AI Analysis Provides

- ⏱️ Time Complexity (O(n), O(n²), etc.)
- 💾 Space Complexity
- ❌ Mistakes (off-by-one, null refs)
- ⚠️ Missing Edge Cases
- ✅ Improvements
- 📈 Brute → Optimal Path
- 💡 Hints (no spoilers)

---

## 🎨 UI Features

- **URL Input** → Fetch button
- **Problem Display** → Title, difficulty, description
- **Monaco Editor** → 5 languages (JS, Python, Java, C++, C)
- **AI Feedback Panel** → Color-coded sections
- **Notes & Status** → Personal tracking
- **Saved Questions** → List with filters

---

## 📊 Status

✅ Backend complete (3 new files)
✅ AI Service complete (1 new file)
✅ Frontend complete (1 new file)
✅ All routes registered
✅ Dependencies installed
✅ Documentation written

---

## 🧪 Testing Checklist

After starting services:

1. ✅ Login to system
2. ✅ Go to `/leetcode-tracker`
3. ✅ Fetch a problem (paste URL)
4. ✅ Write code
5. ✅ Analyze code (check AI feedback)
6. ✅ Save question
7. ✅ View saved questions list

---

## 🔧 Troubleshooting

**Services not starting?**
- Wait 15-20 seconds
- Check MongoDB: `Get-Process mongod`
- Restart script if needed

**Fetch fails?**
- Check URL format: `https://leetcode.com/problems/<slug>/`
- Try different problem
- LeetCode may block (rare)

**AI not responding?**
- Check port 8001 window for errors
- Backend has fallback response
- Restart AI service if needed

**Can't save?**
- Check MongoDB is running
- Verify you're logged in
- Check backend logs

---

## 📚 Full Documentation

See `LEETCODE_TRACKER_README.md` for complete documentation.

---

## 🎉 Ready!

All code is complete. Services should be starting now.

**Main URL:** http://localhost:5173/leetcode-tracker

Wait for servers to fully start (10-15 seconds), then begin testing!
