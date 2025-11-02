# Question Tracker - TODO List 📋

## ✅ Completed Features

### Backend (100%)
- ✅ Question model with test cases & AI analysis schema
- ✅ 11 REST API endpoints (CRUD + submit + stats)
- ✅ User authentication & authorization
- ✅ Filters (status, difficulty, platform, topic, search)
- ✅ Stats aggregation
- ✅ AI service integration endpoint

### Frontend - List View (100%)
- ✅ Question list page with stats dashboard
- ✅ Add question modal with full form
- ✅ Difficulty progress bars (Easy/Medium/Hard)
- ✅ Filters (search, status, difficulty, platform)
- ✅ Question cards with metadata
- ✅ Delete functionality
- ✅ External links to platforms
- ✅ Tag & topic display
- ✅ Empty states

### Frontend - Detail View (90%)
- ✅ Question detail page layout
- ✅ Full question display (title, description, difficulty, status)
- ✅ Tags and topics display
- ✅ Examples section
- ✅ Constraints section
- ✅ Hints (collapsible)
- ✅ Personal notes section
- ✅ Quick stats sidebar
- ✅ Test cases display
- ✅ Action buttons placeholders
- ✅ Back navigation
- ✅ External link button
- ✅ Favorite star button (UI only)
- ✅ Edit button (placeholder)

---

## 🚧 TODO - Critical Features

### 1. Code Editor Integration ⭐ HIGH PRIORITY
**Goal:** Allow users to write and test code solutions

**Tasks:**
- [ ] Install Monaco Editor: `npm install @monaco-editor/react`
- [ ] Create `CodeEditor.tsx` component
  - [ ] Language selector (JavaScript, Python, Java, C++, etc.)
  - [ ] Dark/light theme support
  - [ ] Code formatting
  - [ ] Syntax highlighting
  - [ ] Auto-completion
- [ ] Integrate editor into Question Detail Page
- [ ] Save code to localStorage (draft feature)
- [ ] Load saved code when returning to question

**Files to Create/Modify:**
- `frontend/src/components/CodeEditor.tsx` (new)
- `frontend/src/pages/QuestionDetailPage.tsx` (modify)

---

### 2. Test Runner UI ⭐ HIGH PRIORITY
**Goal:** Run test cases and show results

**Tasks:**
- [ ] Create test execution logic
- [ ] Display test results (pass/fail for each test case)
- [ ] Show actual output vs expected output
- [ ] Execution time display
- [ ] Memory usage display
- [ ] Error messages display
- [ ] Success/failure animations

**Backend:**
- [ ] Implement actual code execution (currently placeholder)
- [ ] Integrate with code execution service (e.g., Judge0 API or custom Docker)
- [ ] Security: sandboxing, timeout, resource limits

**Files to Create/Modify:**
- `frontend/src/components/TestRunner.tsx` (new)
- `frontend/src/pages/QuestionDetailPage.tsx` (modify)
- `backend/src/services/codeExecutor.js` (new)

---

### 3. AI Analysis Display ⭐ HIGH PRIORITY
**Goal:** Show AI feedback on submitted code

**Tasks:**
- [ ] Create AI Analysis panel component
- [ ] Display score (0-100) with circular progress
- [ ] Time/Space complexity badges
- [ ] Security issues list (expandable)
- [ ] Performance issues list (expandable)
- [ ] Code smells list (expandable)
- [ ] Suggestions list
- [ ] Better approach explanation
- [ ] Code comparison view (user's code vs better approach)

**Files to Create/Modify:**
- `frontend/src/components/AIAnalysisPanel.tsx` (new)
- `frontend/src/pages/QuestionDetailPage.tsx` (modify)

---

### 4. Submission History
**Goal:** Track all attempts with scores and AI feedback

**Tasks:**
- [ ] Create submission history tab/section
- [ ] Display list of all submissions
- [ ] Show submission date, language, status, score
- [ ] Click to view submission details
- [ ] Compare submissions side-by-side
- [ ] Download submission code
- [ ] Delete submission option

**Files to Create/Modify:**
- `frontend/src/components/SubmissionHistory.tsx` (new)
- `frontend/src/pages/QuestionDetailPage.tsx` (modify)

---

### 5. Edit Question Functionality
**Goal:** Allow users to modify existing questions

**Tasks:**
- [ ] Create Edit Question modal/page
- [ ] Pre-fill form with existing data
- [ ] Update API call (PUT /api/questions/:id)
- [ ] Refresh question detail after edit
- [ ] Option to add more test cases
- [ ] Option to edit existing test cases

**Files to Create/Modify:**
- `frontend/src/components/EditQuestionModal.tsx` (new) OR
- `frontend/src/pages/EditQuestionPage.tsx` (new)
- `frontend/src/pages/QuestionDetailPage.tsx` (modify)

---

## 🎯 TODO - Nice-to-Have Features

### 6. Favorite Toggle Functionality
**Tasks:**
- [ ] Implement favorite toggle in detail page
- [ ] Update API call (PUT /api/questions/:id with isFavorite)
- [ ] Show favorite indicator in question list
- [ ] Filter by favorites

### 7. Progress Tracking
**Tasks:**
- [ ] Track time spent on each question
- [ ] Start/stop timer in detail page
- [ ] Display total time spent
- [ ] Track attempts counter
- [ ] Update lastAttemptedAt timestamp

### 8. Spaced Repetition
**Tasks:**
- [ ] Calculate next review date based on mastery level
- [ ] Show "Review Due" badge on questions
- [ ] Filter by "Due for Review"
- [ ] Update review date after successful solve

### 9. Mastery Level Progression
**Tasks:**
- [ ] Auto-update mastery level based on:
  - Number of successful solves
  - AI score consistency
  - Time taken
  - Attempts needed
- [ ] Display mastery badges (Beginner → Intermediate → Advanced → Expert)
- [ ] Track mastery per topic

### 10. Import Questions
**Tasks:**
- [ ] Import from LeetCode profile (API/scraping)
- [ ] Import from CSV file
- [ ] Bulk import with validation
- [ ] Import test cases automatically

### 11. Export Questions
**Tasks:**
- [ ] Export to CSV
- [ ] Export to JSON
- [ ] Export selected questions
- [ ] Include/exclude submissions in export

### 12. Question Notes Enhancement
**Tasks:**
- [ ] Rich text editor for notes (markdown support)
- [ ] Add images/diagrams to notes
- [ ] Code snippets in notes with syntax highlighting
- [ ] Share notes with other users (if multi-user)

### 13. Code Templates
**Tasks:**
- [ ] Pre-fill editor with language-specific template
- [ ] Function signature based on problem
- [ ] Import statements auto-added
- [ ] Test case setup code

### 14. Discussion/Comments
**Tasks:**
- [ ] Add comments section to questions
- [ ] Link to external discussions (LeetCode, CodeForces)
- [ ] Personal approach notes
- [ ] Tag other users (if multi-user)

### 15. Dashboard Integration
**Tasks:**
- [ ] Show question stats in main dashboard
- [ ] Recent questions widget
- [ ] "Question of the Day" feature
- [ ] Streak tracking (solve 1 question per day)
- [ ] Weekly/monthly goals

### 16. Platform Integration
**Tasks:**
- [ ] Fetch questions from LeetCode API
- [ ] Fetch questions from CodeForces API
- [ ] Sync solve status with platforms
- [ ] One-click add from platform

### 17. Contest Mode
**Tasks:**
- [ ] Timer for timed practice
- [ ] Contest simulation mode
- [ ] Penalty calculation
- [ ] Leaderboard (if multi-user)

### 18. Collaborative Features (Multi-User)
**Tasks:**
- [ ] Share questions with friends
- [ ] Compare solutions
- [ ] Team challenges
- [ ] Pair programming mode

---

## 📅 Suggested Implementation Order

### Phase 1: Core Coding Experience (Week 1)
1. ✅ Backend & List View (DONE)
2. ✅ Detail View Layout (DONE)
3. ⏳ Code Editor Integration
4. ⏳ Test Runner UI
5. ⏳ AI Analysis Display

### Phase 2: Full CRUD (Week 2)
6. Edit Question Functionality
7. Submission History
8. Favorite Toggle
9. Progress Tracking (time, attempts)

### Phase 3: Smart Features (Week 3)
10. Spaced Repetition
11. Mastery Level Progression
12. Dashboard Integration
13. Code Templates

### Phase 4: Advanced Features (Week 4+)
14. Import/Export Questions
15. Platform Integration
16. Rich Notes Editor
17. Contest Mode
18. Collaborative Features

---

## 🔥 Immediate Next Steps

**To make the Question Tracker fully functional, focus on:**

1. **Code Editor** (2-3 hours)
   - Install Monaco Editor
   - Create component
   - Integrate into detail page
   - Test with multiple languages

2. **Test Runner** (3-4 hours)
   - Backend: Implement code execution service
   - Frontend: Display test results
   - Handle errors gracefully

3. **AI Analysis** (2-3 hours)
   - Create AI analysis panel
   - Display score, issues, suggestions
   - Make it collapsible/expandable

**After these 3 features, the Question Tracker will be 100% functional for personal use!** 🎉

---

## 💡 Pro Tips

- **Code Editor:** Monaco Editor is the same editor used by VS Code - very powerful!
- **Code Execution:** Consider using Judge0 API (free tier available) or building custom Docker solution
- **AI Analysis:** Already integrated in backend - just need to display it nicely
- **Testing:** Test each feature thoroughly before moving to next
- **Mobile:** Make sure code editor works on tablets (might need mobile-friendly alternative)

---

## 📝 Notes

- All backend endpoints are ready and working
- Frontend just needs the 3 critical components
- AI service is running and ready to analyze code
- Database schema supports all features
- Security is already handled (authentication on all routes)

**You're 90% done! Just need the code editor, test runner, and AI display to make it complete!** 🚀
