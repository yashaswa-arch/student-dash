# Question Tracker - Testing Guide 🧪

## Step-by-Step Testing Example

### 1️⃣ Start All Services

Open **3 terminals** and run:

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```
Should see: `Server running on port 5000` ✅

**Terminal 2 - AI Service:**
```powershell
cd ai-service
python simple_main.py
```
Should see: `AI Service running on port 8001` ✅

**Terminal 3 - Frontend:**
```powershell
cd frontend
npm run dev
```
Should see: `Local: http://localhost:5173` ✅

---

### 2️⃣ Login to Your Account

1. Open browser: `http://localhost:5173`
2. Login with your existing account (e.g., `yash@gmail.com`)
3. You'll see the Dashboard

---

### 3️⃣ Navigate to Question Tracker

**Option A - From Dashboard:**
- Look for "Practice & Questions" tab
- Click **"View Tracker"** button (purple button)

**Option B - Direct URL:**
- Go to: `http://localhost:5173/questions`

You should see:
- Empty state with "No questions yet" message
- Stats showing 0/0/0/0
- **"+ Add Question"** button at top right

---

### 4️⃣ Add Your First Question - "Two Sum" Example

Click **"+ Add Question"** button. A modal will open.

**Fill in the form:**

**Title:**
```
Two Sum
```

**Platform:** `LeetCode` (from dropdown)

**Difficulty:** `Easy` (from dropdown)

**Platform URL:**
```
https://leetcode.com/problems/two-sum/
```

**Description:**
```
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.
```

**Tags:** (Add these one by one)
- `array`
- `hash-table`
- `interview`

**Topics:** (Click to select)
- ✅ Array
- ✅ Hash Table
- ✅ Two Pointers

**Test Cases:** (Click "+ Add Test Case" for more)

Test Case 1:
- Input: `[2,7,11,15], 9`
- Expected Output: `[0,1]`

Test Case 2 (click + Add Test Case):
- Input: `[3,2,4], 6`
- Expected Output: `[1,2]`

Test Case 3 (click + Add Test Case):
- Input: `[3,3], 6`
- Expected Output: `[0,1]`

**Constraints:**
```
2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists
```

**Hints:** (Click "+ Add Hint" for more)

Hint 1:
```
Think about using a hash map to store numbers you've seen
```

Hint 2:
```
For each number, check if (target - current number) exists in the map
```

**Personal Notes:**
```
Classic interview question. Remember to use HashMap for O(n) solution.
Brute force is O(n^2) - avoid nested loops!
```

**Click "Add Question"** ✅

---

### 5️⃣ Verify the Question Was Added

You should now see:
- **Stats updated:** Total: 1, Todo: 1
- **Difficulty progress:** Easy: 0/1 (with progress bar)
- **Question card showing:**
  - ⚠ Gray "Todo" icon
  - Title: "Two Sum"
  - Green "todo" badge
  - Green "easy" badge
  - Blue "leetcode" badge
  - Tags: array, hash-table, interview
  - 🔗 External link button (opens LeetCode)
  - ✏️ Edit button
  - 🗑️ Delete button

---

### 6️⃣ Test Filters

**Search:**
- Type "two" in search box
- Should show "Two Sum"
- Type "three" 
- Should show empty state

**Status Filter:**
- Select "Todo" - shows Two Sum
- Select "Solved" - shows empty
- Select "All" - shows Two Sum

**Difficulty Filter:**
- Select "Easy" - shows Two Sum
- Select "Hard" - shows empty

**Platform Filter:**
- Select "LeetCode" - shows Two Sum
- Select "CodeForces" - shows empty

---

### 7️⃣ Add More Questions for Testing

**Add "Valid Parentheses" (Medium):**

Click "+ Add Question" again:

**Title:** `Valid Parentheses`
**Platform:** `LeetCode`
**Difficulty:** `Medium`
**URL:** `https://leetcode.com/problems/valid-parentheses/`
**Description:**
```
Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
```
**Tags:** `stack`, `string`, `interview`
**Topics:** Stack, String
**Test Case 1:**
- Input: `"()"`
- Expected: `true`

**Test Case 2:**
- Input: `"()[]{}"`
- Expected: `true`

**Test Case 3:**
- Input: `"(]"`
- Expected: `false`

Click "Add Question" ✅

---

**Add "Longest Substring" (Medium):**

**Title:** `Longest Substring Without Repeating Characters`
**Platform:** `LeetCode`
**Difficulty:** `Medium`
**Description:**
```
Given a string s, find the length of the longest substring without repeating characters.
```
**Tags:** `string`, `sliding-window`, `hard-interview`
**Topics:** String, Sliding Window, Hash Table
**Test Case 1:**
- Input: `"abcabcbb"`
- Expected: `3`

Click "Add Question" ✅

---

### 8️⃣ Verify Stats Update

After adding 3 questions, you should see:

**Stats:**
- Total: **3**
- Solved: **0** (0% complete)
- Attempted: **0**
- Todo: **3**

**Difficulty Progress:**
- Easy: **0 / 1** (green bar)
- Medium: **0 / 2** (yellow bar)
- Hard: **0 / 0** (red bar)

---

### 9️⃣ Test Delete Functionality

1. Find "Longest Substring" card
2. Click 🗑️ (Trash) button
3. Browser confirm dialog appears
4. Click "OK"
5. Question disappears
6. Stats update: Total: 2, Todo: 2

---

### 🔟 Test Edit Navigation (Will create detail page next)

1. Click on any question card (anywhere except the action buttons)
2. Should navigate to `/questions/:id` (will show 404 for now)
3. This is where we'll build the detail page next!

---

## 🧪 API Testing with Postman/Thunder Client

If you want to test the backend directly:

### Get All Questions
```http
GET http://localhost:5000/api/questions
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Stats
```http
GET http://localhost:5000/api/questions/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

### Add Question
```http
POST http://localhost:5000/api/questions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Two Sum",
  "description": "Given an array...",
  "platform": "leetcode",
  "difficulty": "easy",
  "tags": ["array", "hash-table"],
  "topics": ["Array", "Hash Table"],
  "testCases": [
    {
      "input": "[2,7,11,15], 9",
      "expectedOutput": "[0,1]"
    }
  ]
}
```

### Submit Solution (Will implement in detail page)
```http
POST http://localhost:5000/api/questions/:id/submit
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

---

## ✅ What to Expect

### Working Features:
✅ Add questions with full form
✅ View all questions in list
✅ Stats dashboard updates
✅ Difficulty progress bars
✅ Filters (search, status, difficulty, platform)
✅ Delete questions
✅ External links to platforms
✅ Tag display
✅ Empty states

### Not Yet Implemented:
⏳ Question detail page (clicking card shows 404)
⏳ Code editor for submissions
⏳ Test runner UI
⏳ AI analysis display
⏳ Edit question functionality
⏳ Submission history

---

## 🐛 Troubleshooting

**"Failed to add question"**
- Check backend is running on port 5000
- Check you're logged in (token in localStorage)
- Check browser console for errors

**Stats showing 0/0/0/0**
- Wait a moment after adding question
- Refresh the page
- Check browser console

**Modal doesn't open**
- Check browser console for React errors
- Verify framer-motion is installed: `npm install framer-motion`

**Questions not showing**
- Check backend console for errors
- Verify MongoDB is connected
- Check network tab in browser DevTools

---

## 🎯 Next Steps After Testing

Once you've successfully tested the list view and add functionality, we'll build:

1. **Question Detail Page** - View full question with examples, hints, constraints
2. **Code Editor Integration** - Monaco editor for writing solutions
3. **Test Runner** - Run test cases locally
4. **Submit & AI Analysis** - Get AI feedback on your code
5. **Submission History** - See all your attempts with scores

---

## 📊 Expected Results After Testing

After adding 3 questions (1 easy, 2 medium), your tracker should show:

```
╔════════════════════════════════════════╗
║         QUESTION TRACKER              ║
╠════════════════════════════════════════╣
║  Total: 3  │ Solved: 0  │ Attempted: 0 │ Todo: 3  ║
╠════════════════════════════════════════╣
║  Easy:   ▓░░░░░░░░░ 0/1              ║
║  Medium: ▓░░░░░░░░░ 0/2              ║
║  Hard:   ░░░░░░░░░░ 0/0              ║
╠════════════════════════════════════════╣
║  📝 Two Sum                  [Todo]    ║
║     Easy │ LeetCode │ array, hash-table║
║                                        ║
║  📝 Valid Parentheses        [Todo]    ║
║     Medium │ LeetCode │ stack, string  ║
╚════════════════════════════════════════╝
```

Happy Testing! 🚀
