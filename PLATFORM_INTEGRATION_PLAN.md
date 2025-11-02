# 🔗 Coding Platform Integration Plan

## Overview
Integrate LeetCode, HackerRank, CodeForces, CodeChef, and other coding platforms to automatically sync user's coding activity, just like Codolio.

---

## 🎯 Phase 1: Profile Connection UI (Week 1)

### Frontend Components Needed:
1. **Settings Page** - `/settings` or `/profile/connections`
   - List of supported platforms
   - Connect/Disconnect buttons
   - Username input fields
   - Verification status indicators

2. **GitHub Integration Tab** in Profile
   - Already have placeholder
   - Add GitHub OAuth connection
   - Fetch repos, contributions, languages

### Backend API Endpoints:
```
POST   /api/user/connections/add       - Add platform connection
DELETE /api/user/connections/remove    - Remove platform connection
GET    /api/user/connections           - Get all connected platforms
PUT    /api/user/connections/verify    - Verify platform username
GET    /api/user/connections/sync      - Manual sync trigger
```

### Database Schema Addition:
```javascript
// Add to User model
connectedPlatforms: [{
  platform: {
    type: String,
    enum: ['leetcode', 'hackerrank', 'codeforces', 'codechef', 'github'],
    required: true
  },
  username: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  lastSynced: Date,
  stats: {
    totalSolved: Number,
    easySolved: Number,
    mediumSolved: Number,
    hardSolved: Number,
    rating: Number,
    ranking: Number,
    contestsParticipated: Number
  }
}]
```

---

## 🔧 Phase 2: API Integration (Week 2-3)

### Platform APIs to Integrate:

#### 1. **LeetCode**
- **Public API**: `https://leetcode.com/graphql` (GraphQL)
- **Data to fetch**:
  - Total problems solved (easy/medium/hard)
  - Submission history
  - Contest rating
  - Recent submissions
  - Language stats
- **Update frequency**: Daily sync
- **Implementation**: GraphQL queries

```javascript
// Example GraphQL query
{
  matchedUser(username: "username") {
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
    profile {
      ranking
      reputation
    }
  }
}
```

#### 2. **HackerRank**
- **API**: HackerRank doesn't have official public API
- **Workaround**: Web scraping using Puppeteer/Cheerio
- **Data to fetch**:
  - Stars per domain
  - Badges earned
  - Rank
  - Skills certified
- **Update frequency**: Weekly sync

#### 3. **CodeForces**
- **Public API**: `https://codeforces.com/api/`
- **Data to fetch**:
  - Rating
  - Max rating
  - Rank
  - Contest history
  - Problem submissions
- **Update frequency**: After each contest
- **Documentation**: https://codeforces.com/apiHelp

```javascript
// Example API calls
GET /api/user.info?handles=username
GET /api/user.status?handle=username&from=1&count=100
GET /api/user.rating?handle=username
```

#### 4. **CodeChef**
- **Public API**: Web scraping (no official API)
- **Data to fetch**:
  - Rating
  - Stars
  - Global rank
  - Country rank
  - Problems solved
- **Update frequency**: Weekly sync

#### 5. **GitHub**
- **Official API**: `https://api.github.com`
- **OAuth**: GitHub OAuth App
- **Data to fetch**:
  - Contribution graph
  - Repositories
  - Languages used
  - Stars received
  - Commits count
- **Update frequency**: Daily sync

```javascript
// Example API calls
GET /users/{username}
GET /users/{username}/repos
GET /repos/{owner}/{repo}/languages
GET /users/{username}/events
```

---

## 📊 Phase 3: Data Aggregation (Week 4)

### Unified Stats Dashboard:
Combine data from all platforms into one view:

1. **Total Problems Solved** (across all platforms)
2. **Global Rank** (best rank from any platform)
3. **Contest Rating** (weighted average)
4. **Language Proficiency** (aggregated from all platforms)
5. **Topic Mastery** (combined from problem tags)
6. **Activity Timeline** (merged timeline from all platforms)

### Backend Service:
```javascript
// services/platformAggregator.js
class PlatformAggregator {
  async aggregateStats(userId) {
    // Fetch data from all connected platforms
    // Combine and normalize data
    // Update user profile with aggregated stats
  }
  
  async syncPlatform(userId, platform) {
    // Sync specific platform
  }
  
  async syncAll(userId) {
    // Sync all connected platforms
  }
}
```

---

## 🔄 Phase 4: Auto-Sync System (Week 5)

### Background Jobs:
Use cron jobs or task scheduler for automatic syncing:

```javascript
// Sync schedule
- Daily: LeetCode, GitHub
- Weekly: HackerRank, CodeChef
- After Contest: CodeForces
- Manual: On-demand sync button
```

### Implementation:
- **node-cron** for scheduling
- **Bull Queue** for job processing
- **Redis** for caching API responses

```javascript
const cron = require('node-cron');

// Daily sync at 2 AM
cron.schedule('0 2 * * *', async () => {
  await syncAllUsers('leetcode');
  await syncAllUsers('github');
});

// Weekly sync on Sunday
cron.schedule('0 3 * * 0', async () => {
  await syncAllUsers('hackerrank');
  await syncAllUsers('codechef');
});
```

---

## 🎨 Phase 5: UI Enhancement (Week 6)

### Profile Page Updates:

1. **Platform Badges Section**
   - Show connected platforms with logos
   - Display key stats from each platform
   - Quick links to profiles

2. **Combined Activity Heatmap**
   - Merge activity from all platforms
   - Color-coded by platform
   - Hover shows platform-specific details

3. **Platform-wise Breakdown**
   - Tabs for each platform
   - Platform-specific stats
   - Recent activity from that platform

4. **Leaderboard**
   - Compare with other users
   - Filter by platform
   - Filter by topic

---

## 🔐 Phase 6: Security & Privacy (Week 7)

### Security Measures:
1. **API Rate Limiting**
   - Respect platform rate limits
   - Implement exponential backoff
   - Cache responses

2. **User Privacy**
   - Option to make profile public/private
   - Option to hide specific platforms
   - Option to stop auto-sync

3. **Error Handling**
   - Handle API failures gracefully
   - Notify user if sync fails
   - Retry mechanism

---

## 📈 Implementation Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: UI Setup | Week 1 | 🔄 Next |
| Phase 2: API Integration | Week 2-3 | ⏳ Pending |
| Phase 3: Data Aggregation | Week 4 | ⏳ Pending |
| Phase 4: Auto-Sync | Week 5 | ⏳ Pending |
| Phase 5: UI Enhancement | Week 6 | ⏳ Pending |
| Phase 6: Security | Week 7 | ⏳ Pending |

---

## 🚀 Quick Start (What to do NOW)

### Step 1: Create Settings/Connections Page
```typescript
// frontend/src/pages/ConnectionsPage.tsx
- Add form to input platform usernames
- Show connected platforms
- Add verify/sync buttons
```

### Step 2: Update Backend User Model
```javascript
// backend/src/models/User.js
- Add connectedPlatforms array field
- Add sync methods
```

### Step 3: Create Platform Service
```javascript
// backend/src/services/platformService.js
- Create service to fetch from external APIs
- Start with LeetCode (easiest)
```

### Step 4: Test with LeetCode
- Use public GraphQL API
- Fetch user stats
- Display in profile

---

## 🎯 Success Metrics

1. **User Engagement**: % of users who connect at least 1 platform
2. **Sync Accuracy**: % of successful syncs vs failed
3. **Performance**: Average sync time per platform
4. **User Satisfaction**: User feedback on data accuracy

---

## 📝 Notes

- **LeetCode** is easiest to start with (public GraphQL API)
- **GitHub** requires OAuth but has excellent documentation
- **HackerRank** & **CodeChef** require web scraping (more complex)
- **CodeForces** has good public API

---

## 🔗 Useful Links

- LeetCode GraphQL: https://leetcode.com/graphql
- CodeForces API: https://codeforces.com/apiHelp
- GitHub API: https://docs.github.com/en/rest
- Codolio for reference: https://codolio.com

---

**Last Updated**: January 2025
