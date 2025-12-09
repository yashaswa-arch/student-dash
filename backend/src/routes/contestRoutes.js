const express = require('express');
const router = express.Router();
const {
  getUpcomingContests,
  getCalendarContests,
  refreshContests
} = require('../controllers/contestController');

/**
 * @route   GET /api/contests/upcoming
 * @desc    Get upcoming contests
 * @access  Public
 * @query   limit - Number of contests to return (default: 10)
 * @query   platforms - Comma-separated list of platforms (e.g., CODEFORCES,CODECHEF)
 */
router.get('/upcoming', getUpcomingContests);

/**
 * @route   GET /api/contests/calendar
 * @desc    Get contests for a date range
 * @access  Public
 * @query   from - Start date (YYYY-MM-DD, required)
 * @query   to - End date (YYYY-MM-DD, required)
 * @query   platforms - Comma-separated list of platforms (optional)
 */
router.get('/calendar', getCalendarContests);

/**
 * @route   POST /api/contests/refresh
 * @desc    Refresh contests from external aggregator and sync to MongoDB
 * @access  Public (can be protected later)
 */
router.post('/refresh', refreshContests);

module.exports = router;

