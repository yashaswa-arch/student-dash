const Contest = require('../models/Contest');
const { refreshContestsFromAggregator } = require('../services/contestSyncService');

/**
 * @route   GET /api/contests/upcoming
 * @desc    Get upcoming contests
 * @access  Public
 */
const getUpcomingContests = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const platformsParam = req.query.platforms;
    const now = new Date();

    const query = {
      endTime: { $gte: now }, // anything not finished yet
    };

    if (platformsParam) {
      const platforms = platformsParam.split(',').map(p => p.trim().toUpperCase()).filter(Boolean);
      if (platforms.length) query.platform = { $in: platforms };
    }

    const contests = await Contest.find(query).sort({ startTime: 1 }).limit(limit).lean();
    console.log('Upcoming contests count:', contests.length);
    return res.json({ success: true, data: contests });
  } catch (err) {
    console.error('Error in getUpcomingContests:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load upcoming contests' });
  }
};

/**
 * @route   GET /api/contests/calendar
 * @desc    Get contests for a date range (calendar view)
 * @access  Public
 */
const getCalendarContests = async (req, res) => {
  try {
    const platformsParam = req.query.platforms;
    let { from, to } = req.query;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based

    if (!from) {
      from = new Date(year, month, 1);
    } else {
      from = new Date(from);
    }

    if (!to) {
      to = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month
    } else {
      to = new Date(to);
      to.setHours(23, 59, 59, 999);
    }

    const query = {
      startTime: { $gte: from, $lte: to },
    };

    if (platformsParam) {
      const platforms = platformsParam.split(',').map(p => p.trim().toUpperCase()).filter(Boolean);
      if (platforms.length) query.platform = { $in: platforms };
    }

    const contests = await Contest.find(query).sort({ startTime: 1 }).lean();
    console.log('Calendar contests count:', contests.length, 'range:', from, to);
    return res.json({ success: true, data: contests });
  } catch (err) {
    console.error('Error in getCalendarContests:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load calendar contests' });
  }
};

/**
 * @route   POST /api/contests/refresh
 * @desc    Refresh contests from external aggregator and sync to MongoDB
 * @access  Public (can be protected later)
 */
const refreshContests = async (req, res) => {
  try {
    const result = await refreshContestsFromAggregator();
    return res.json({ 
      success: true, 
      message: 'Contests refreshed', 
      ...result 
    });
  } catch (err) {
    console.error('Error refreshing contests:', err.message);
    return res.status(502).json({ 
      success: false, 
      message: 'Failed to refresh contests' 
    });
  }
};

module.exports = {
  getUpcomingContests,
  getCalendarContests,
  refreshContests
};

