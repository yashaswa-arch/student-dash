# Project Bug, Issue & Limitation Report

## 1. Purpose of This Document

This document serves as a comprehensive tracking system for bugs, resolved issues, known limitations, and future risks identified during the development, testing, and integration phases of the Student Dash project. It is designed as a living document that will be continuously updated as the project evolves, new features are added, and issues are discovered or resolved.

This report ensures transparency, maintainability, and provides a clear record of the project's technical health for developers, contributors, and stakeholders.

---

## 2. Scope of Review

The following modules and components have been reviewed during the creation and maintenance of this document:

### Backend Modules
- **Authentication System**: JWT-based authentication, user registration, login, token verification
- **Coding Platforms Integration**: Codeforces and HackerRank profile management
- **API Routing**: Express.js routes for all endpoints
- **Sync Logic**: External platform data synchronization
- **Data Models**: MongoDB schemas (User, CodingProfile, PracticeSubmission, AptitudeAttempt, etc.)
- **Error Handling**: Middleware and error response handling
- **Validation**: Input validation and sanitization

### Frontend Modules
- **Profile UI**: User profile page with tabs (Overview, Coding Platforms)
- **Coding Platforms Tab**: Master-detail layout, chart visualizations, sync functionality
- **State Management**: React state, Redux store, component lifecycle
- **API Integration**: Axios-based API calls, authentication token handling
- **UI Components**: Form handling, chart rendering, empty states

### Integration Points
- **Codeforces API**: External API integration for user statistics
- **HackerRank**: Manual profile management (no public API)
- **Chart Libraries**: Recharts integration for data visualization
- **Authentication Flow**: Frontend-backend token exchange

---

## 3. Resolved Bugs

### BUG-01: UserId Type Mismatch in Practice Submission Queries
- **Discovery Phase**: API Integration / Frontend Wiring
- **Description**: Charts were not generating for practice submissions when users logged in with different accounts. The `PracticeSubmission` model stored `userId` as a String, but backend routes were using `req.user._id` (MongoDB ObjectId) directly in queries, causing type mismatch.
- **Root Cause**: Inconsistent data type between model schema (String) and query parameter (ObjectId) in aggregation pipelines.
- **Fix Implemented**: 
  - **File**: `backend/src/routes/practiceSubmissionRoutes.js`
  - **Logic**: Modified all route handlers to explicitly convert `req.user._id` to string using `.toString()` before using it in queries
  - **Additional**: Removed unnecessary `userId` query parameter from frontend API calls, as backend now correctly extracts user ID from authentication token
- **Resolution Status**: ✅ Resolved
- **Resolution Date**: During Coding Platforms feature development phase

### BUG-02: Charts Not Rendering for New Users
- **Discovery Phase**: UI/UX Testing
- **Description**: When a new user logged in and solved questions in quick practice, submissions were recorded but charts were not generated. This was directly related to BUG-01.
- **Root Cause**: Type mismatch prevented MongoDB aggregation queries from matching user submissions.
- **Fix Implemented**: Same as BUG-01 - type conversion in backend routes.
- **Resolution Status**: ✅ Resolved
- **Resolution Date**: Same as BUG-01

### BUG-03: React Hooks Violation in CodingPlatformsTab Component
- **Discovery Phase**: Frontend Development
- **Description**: Component showed black screen when rendering charts. The `useMemo` hook was being called inside an Immediately Invoked Function Expression (IIFE), violating React's Rules of Hooks.
- **Root Cause**: Hooks can only be called at the top level of a React component, not inside callbacks, loops, or nested functions.
- **Fix Implemented**:
  - **File**: `frontend/src/components/CodingPlatformsTab.tsx`
  - **Logic**: Moved `useMemo` hook outside the IIFE to the top level of the component, pre-computing all chart data based on `selectedProfile` dependency
- **Resolution Status**: ✅ Resolved
- **Resolution Date**: During Coding Platforms analytics feature implementation

### BUG-04: Missing Profile Refresh After Save
- **Discovery Phase**: Frontend Wiring
- **Description**: After saving a coding profile, the profile list in the left sidebar did not reflect the latest data from the backend, potentially showing stale information.
- **Root Cause**: State was updated locally without refreshing from the server after save operation.
- **Fix Implemented**:
  - **File**: `frontend/src/components/CodingPlatformsTab.tsx`
  - **Logic**: Added explicit API call to `GET /api/coding-profiles/me` after successful profile save to refresh the entire profiles list
- **Resolution Status**: ✅ Resolved
- **Resolution Date**: During Coding Platforms form enhancement phase

---

## 4. Known Issues & Edge Cases (Open)

### ISSUE-01: Codeforces API Limited Data Availability
- **Description**: The Codeforces API (`user.info` endpoint) does not provide solved problem counts by difficulty (easySolved, mediumSolved, hardSolved) or total solved problems. These fields are set to `null` in the service response.
- **Reason**: Codeforces API limitations - the `user.info` endpoint only provides rating, maxRating, rank, and basic user information, not problem-solving statistics.
- **Impact**: 
  - Difficulty breakdown charts show "—" or empty data for Codeforces profiles
  - Total solved count is not available
  - Users may see incomplete analytics
- **Planned Approach**: 
  - Consider using Codeforces API's `user.status` endpoint to calculate solved problems (requires parsing submission history)
  - Alternative: Display only available metrics (rating, maxRating, rank) prominently
  - Document this limitation in UI with helpful messaging

### ISSUE-02: HackerRank No Public API
- **Description**: HackerRank does not provide a public API for fetching user statistics. The sync service initializes empty stats for HackerRank profiles.
- **Reason**: Third-party platform limitation - HackerRank does not expose public APIs for user data.
- **Impact**:
  - HackerRank profiles cannot be automatically synced
  - All stats remain at default values (0 or null)
  - Users must manually update their HackerRank statistics if needed
- **Planned Approach**:
  - Consider allowing manual input of HackerRank statistics
  - Display clear messaging that HackerRank sync is not available
  - Future: Explore web scraping as alternative (with proper rate limiting and legal considerations)

### ISSUE-03: Codeforces URL Extraction Edge Cases
- **Description**: The URL extraction logic in `upsertProfile` controller uses a regex pattern that may fail for:
  - URLs with query parameters after the handle
  - URLs with trailing slashes
  - Non-standard Codeforces domain variations
  - Malformed or incomplete URLs
- **Reason**: Regex pattern `/codeforces\.com\/profile\/([^\/\?#]+)/i` may not handle all URL variations perfectly.
- **Impact**:
  - Users entering valid but non-standard URL formats may see "Handle or valid profile URL is required" error
  - Minor inconvenience requiring users to retry with standard format
- **Planned Approach**:
  - Enhance regex to handle more URL variations
  - Add URL normalization before extraction
  - Provide clearer error messages with examples

### ISSUE-04: Sync Errors Silently Logged
- **Description**: In `upsertProfile` controller, if `syncCodingProfile` fails, the error is logged but the request still succeeds. The profile is saved without synced stats.
- **Reason**: Intentional design to not fail profile creation if external API is temporarily unavailable.
- **Impact**:
  - Users may not be aware that sync failed
  - Profile is created but stats remain empty/null
  - Requires manual sync later
- **Planned Approach**:
  - Consider showing a warning toast if sync fails during profile creation
  - Add retry mechanism for failed syncs
  - Track sync failure status in profile model

### ISSUE-05: No Retry Logic for External API Calls
- **Description**: Codeforces API calls have a 10-second timeout but no retry mechanism. If the API is temporarily unavailable or rate-limited, the sync fails immediately.
- **Reason**: Current implementation uses single-attempt axios calls without retry logic.
- **Impact**:
  - Temporary network issues or API rate limits cause sync failures
  - Users must manually retry sync operations
- **Planned Approach**:
  - Implement exponential backoff retry logic for external API calls
  - Add rate limit detection and handling
  - Consider queue-based sync for better reliability

### ISSUE-06: Chart Rendering with Zero Data
- **Description**: Charts (RadialBarChart, PieChart, RadarChart) may not render properly or may show empty/confusing visuals when all data values are zero or null.
- **Reason**: Chart libraries may have edge cases with zero/null data that aren't fully handled.
- **Impact**:
  - Poor user experience when viewing profiles with no data
  - Potential visual glitches or empty chart areas
- **Planned Approach**:
  - Add explicit checks for zero/null data before rendering charts
  - Show informative empty states instead of broken charts
  - Ensure all chart components handle edge cases gracefully

### ISSUE-07: Race Condition in Profile Selection
- **Description**: When multiple profiles are added quickly or when profiles are deleted, the `selectedProfileId` state might point to a non-existent profile temporarily, causing UI inconsistencies.
- **Reason**: State updates may not be perfectly synchronized with profile list updates.
- **Impact**:
  - Brief moments where selected profile doesn't exist in the list
  - Potential UI flickering or errors
- **Planned Approach**:
  - Add validation to ensure `selectedProfileId` always points to an existing profile
  - Implement defensive checks in component rendering
  - Consider using `useEffect` to auto-correct invalid selections

---

## 5. Known Limitations (Non-bugs)

### LIM-01: HackerRank Public API Unavailability
- **Description**: HackerRank does not provide a public API for accessing user statistics, problem-solving history, or profile data.
- **Impact**: HackerRank profiles cannot be automatically synced. All statistics must be manually entered or remain at default values.
- **Workaround**: Users can manually update their HackerRank handle, but statistics will not be automatically populated.

### LIM-02: Codeforces API Data Limitations
- **Description**: The Codeforces `user.info` API endpoint does not provide:
  - Total problems solved count
  - Problems solved by difficulty (Easy/Medium/Hard)
  - Contest participation history (only current rank available)
- **Impact**: Difficulty breakdown and total solved statistics are not available for Codeforces profiles through the API.
- **Workaround**: Only rating, maxRating, and rank are displayed for Codeforces profiles.

### LIM-03: Manual Sync Requirement
- **Description**: External platform statistics are not automatically updated. Users must manually click "Sync Now" to refresh their statistics from external platforms.
- **Impact**: Data may become stale if users don't regularly sync their profiles.
- **Workaround**: Users are encouraged to sync after participating in contests or solving problems.

### LIM-04: Missing Data for New Accounts
- **Description**: New Codeforces accounts or accounts with no contest participation will have null or zero values for rating, maxRating, and rank.
- **Impact**: Charts and statistics may show empty or zero values for new users.
- **Workaround**: UI gracefully handles null/zero values by displaying "—" or empty state messages.

### LIM-05: Single Platform Per User Limitation
- **Description**: The `CodingProfile` model enforces a unique compound index on `{ user, platform }`, meaning a user can only have one profile per platform (one Codeforces, one HackerRank).
- **Impact**: Users cannot link multiple Codeforces accounts or multiple HackerRank accounts.
- **Workaround**: Users must unlink existing profile before linking a different account for the same platform.

### LIM-06: Visualization Dependency on External Data
- **Description**: Chart visualizations (RadialBarChart, PieChart, RadarChart) depend entirely on data from external platforms. If external APIs are unavailable or return limited data, charts may be empty or show minimal information.
- **Impact**: Analytics view may appear incomplete for users with limited external platform data.
- **Workaround**: UI shows helpful empty states and messages when data is unavailable.

### LIM-07: No Historical Data Tracking
- **Description**: The system only stores current snapshot of statistics. Historical changes in rating, solved problems, or other metrics are not tracked over time.
- **Impact**: Users cannot view progress trends or historical performance graphs.
- **Workaround**: Users can manually track progress by noting statistics at different times.

---

## 6. Security & Data Integrity Notes

### SEC-01: JWT Authentication
- **Implementation**: All protected routes use JWT (JSON Web Tokens) for authentication
- **Token Storage**: Tokens are stored in browser `localStorage`
- **Token Validation**: Backend validates tokens on every protected request using `auth` middleware
- **Token Expiration**: Tokens expire after 7 days (configurable)
- **Security Considerations**: 
  - Tokens are automatically removed from localStorage on 401 responses
  - Users are redirected to login page on token expiration
  - Token verification includes user existence check

### SEC-02: User Ownership Validation
- **Implementation**: All coding profile operations (read, update, delete, sync) verify that the profile belongs to the authenticated user
- **Files**: 
  - `backend/src/controllers/codingProfileController.js` - All controller functions check `req.user._id`
  - `backend/src/routes/codingProfileRoutes.js` - All routes protected by `auth` middleware
- **Security Considerations**:
  - Users cannot access or modify other users' profiles
  - Profile deletion requires ownership verification
  - Sync operations are scoped to authenticated user's profiles only

### SEC-03: Explicit User Consent for External Platform Linking
- **Implementation**: Users must explicitly provide their handle or profile URL to link external platforms
- **Privacy**: No automatic linking or data collection without user action
- **Transparency**: Users are informed about what data will be fetched from external platforms

### SEC-04: Unlink Option for Privacy and Control
- **Implementation**: Users can unlink their external platform profiles at any time using the "Unlink" button
- **Privacy**: Immediate removal of linked profile from the system
- **Control**: Users have full control over which platforms are connected to their account
- **Data Deletion**: Unlinking permanently removes the profile record from the database

### SEC-05: Input Validation and Sanitization
- **Implementation**: 
  - Backend validates platform enum values (CODEFORCES, HACKERRANK)
  - Handle values are trimmed and validated for non-empty strings
  - URL extraction uses regex pattern matching to prevent injection
- **Security Considerations**:
  - Prevents invalid data from being stored
  - Reduces risk of code injection through malformed inputs
  - Validates user input before database operations

### SEC-06: Error Message Information Disclosure
- **Implementation**: Error messages in development mode include stack traces, but production mode hides detailed error information
- **Files**: `backend/src/middleware/errorHandler.js`
- **Security Considerations**: Prevents sensitive information leakage in production environments

---

## 7. Update & Maintenance Policy

This bug report is a **dynamic document** that will be continuously updated throughout the project lifecycle. The following guidelines ensure long-term maintainability and transparency:

### Update Triggers

This document will be updated whenever:

1. **New Features Added**: When new features are implemented, potential issues or limitations introduced by those features will be documented
2. **Bugs Discovered**: New bugs discovered during development, testing, or production use will be added with unique IDs
3. **Bugs Resolved**: When bugs are fixed, they will be moved to the "Resolved Bugs" section with resolution details
4. **Third-Party API Changes**: If external APIs (Codeforces, HackerRank) change their behavior, limitations, or endpoints, this will be documented
5. **Regressions**: If previously resolved bugs reappear, they will be documented as new issues with references to original bug IDs
6. **Security Concerns**: Any security-related issues or improvements will be documented in the Security section
7. **Performance Issues**: Significant performance problems or bottlenecks will be documented

### Maintenance Guidelines

- **ID Assignment**: Bugs and issues are assigned sequential IDs (BUG-01, BUG-02, ISSUE-01, ISSUE-02, etc.)
- **Date Tracking**: Resolution dates should be approximate (development phase or actual date if known)
- **Cross-References**: When bugs are related, cross-reference them using bug IDs
- **Status Updates**: Regularly review and update the status of open issues
- **Version Control**: This document is tracked in version control to maintain history

### Review Schedule

- **Pre-Release**: Review and update before each major release
- **Post-Release**: Review after deployment to capture production issues
- **Quarterly**: Comprehensive review of all open issues and limitations
- **Ad-Hoc**: Update immediately when critical bugs are discovered

---

## Document Version History

- **v1.0** (Initial Creation): Comprehensive bug report created during Coding Platforms feature development
- **Last Updated**: Current development phase
- **Next Review**: Before next major feature release

---

## Notes for Contributors

When adding new entries to this document:

1. Use the established ID format (BUG-XX, ISSUE-XX, LIM-XX, SEC-XX)
2. Provide clear, concise descriptions
3. Include file paths and code locations when relevant
4. Maintain professional, academic tone suitable for a college project
5. Only document real issues found in the codebase, not hypothetical problems
6. Update resolution status and dates when issues are fixed

---

*This document is maintained as part of the Student Dash project repository and should be updated regularly to reflect the current state of the codebase.*

