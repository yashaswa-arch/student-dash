const express = require('express');
const router = express.Router();
const PracticeSubmission = require('../models/PracticeSubmission');
const { auth } = require('../middleware/auth');
const websocketService = require('../services/websocketService');

/**
 * IMPORTANT: All stats calculations use verdict === 'PASSED' to count as solved.
 * 
 * Only submissions with verdict === 'PASSED' are counted as solved.
 * Submissions with verdict === 'FAILED', 'COMPILE_ERROR', 'RUNTIME_ERROR', or 'PENDING'
 * are treated as attempted, not solved.
 * 
 * This applies to:
 * - Total solved count
 * - Topic-wise solved stats
 * - Difficulty-wise solved stats
 * - Streak calculations
 */

// POST /api/submissions
// Body: {
//   questionId, language, code, stdout, stderr, 
//   verdict, passedTests, totalTests (new fields)
//   status (legacy, optional for backward compatibility)
//   questionTitle, topics, difficulty, timeTakenInMinutes, source
// }
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const {
      questionId,
      language,
      code,
      stdout,
      stderr,
      verdict, // New: PENDING | PASSED | FAILED | COMPILE_ERROR | RUNTIME_ERROR
      passedTests, // New: number of tests passed
      totalTests, // New: total number of tests
      status, // Legacy field, kept for backward compatibility
      questionTitle,
      topics,
      difficulty,
      timeTakenInMinutes,
      source
    } = req.body;

    // Base validation
    if (!questionId || !language || !code) {
      return res.status(400).json({
        success: false,
        message: 'questionId, language, and code are required'
      });
    }

    // Validate verdict if provided
    const validVerdicts = ['PENDING', 'PASSED', 'FAILED', 'COMPILE_ERROR', 'RUNTIME_ERROR'];
    const finalVerdict = verdict && validVerdicts.includes(verdict) 
      ? verdict 
      : 'PENDING';
    
    // Validate test counts
    const finalPassedTests = typeof passedTests === 'number' && passedTests >= 0 
      ? passedTests 
      : 0;
    const finalTotalTests = typeof totalTests === 'number' && totalTests >= 0 
      ? totalTests 
      : 0;

    const normalizedSource = source || 'quick-practice';

    // Extra validation for Quick Practice submissions
    if (normalizedSource === 'quick-practice') {
      if (!questionTitle || typeof questionTitle !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'questionTitle is required for quick-practice submissions'
        });
      }

      if (!Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'topics (non-empty array) is required for quick-practice submissions'
        });
      }

      if (!difficulty) {
        return res.status(400).json({
          success: false,
          message: 'difficulty is required for quick-practice submissions'
        });
      }
    }

    const submission = await PracticeSubmission.create({
      userId,
      questionId,
      questionTitle,
      topics: Array.isArray(topics) ? topics : [],
      difficulty,
      language,
      code,
      stdout: stdout || '',
      stderr: stderr || '',
      // New evaluation fields
      verdict: finalVerdict,
      passedTests: finalPassedTests,
      totalTests: finalTotalTests,
      // Legacy status field (for backward compatibility only)
      status: status || (finalVerdict === 'PASSED' ? 'success' : 'error'),
      timeTakenInMinutes,
      source: normalizedSource
    });

    // Emit WebSocket event for real-time dashboard updates
    try {
      websocketService.emitSubmission(userId, submission);
    } catch (wsError) {
      console.error('Error emitting WebSocket event:', wsError);
      // Don't fail the request if WebSocket fails
    }

    res.status(201).json({
      success: true,
      data: {
        ...submission.toObject(),
        // Ensure new fields are always returned
        verdict: submission.verdict,
        passedTests: submission.passedTests,
        totalTests: submission.totalTests
      }
    });
  } catch (error) {
    console.error('Error creating practice submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save submission',
      error: error.message
    });
  }
});

// GET /api/submissions/stats/overview
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [stats] = await PracticeSubmission.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          // Only verdict === 'PASSED' counts as solved
          // FAILED, COMPILE_ERROR, RUNTIME_ERROR, PENDING are all treated as attempted, not solved
          totalSolved: {
            $sum: {
              $cond: [{ $eq: ['$verdict', 'PASSED'] }, 1, 0]
            }
          },
          attemptedButUnsolved: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$verdict', 'PASSED'] },
                    { $ne: ['$verdict', 'PENDING'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          solvedLast7Days: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$verdict', 'PASSED'] },
                    { $gte: ['$createdAt', sevenDaysAgo] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats || {
        totalSubmissions: 0,
        totalSolved: 0,
        attemptedButUnsolved: 0,
        solvedLast7Days: 0
      }
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview stats',
      error: error.message
    });
  }
});

// GET /api/submissions/stats/by-topic
router.get('/stats/by-topic', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const results = await PracticeSubmission.aggregate([
      { $match: { userId: userId, topics: { $exists: true, $ne: [] } } },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          totalSubmissions: { $sum: 1 },
          // Only verdict === 'PASSED' counts as solved
          totalSolved: {
            $sum: {
              $cond: [{ $eq: ['$verdict', 'PASSED'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalSubmissions: -1 } }
    ]);

    res.json({
      success: true,
      data: results.map((r) => ({
        topic: r._id,
        totalSubmissions: r.totalSubmissions,
        totalSolved: r.totalSolved
      }))
    });
  } catch (error) {
    console.error('Error fetching stats by topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic stats',
      error: error.message
    });
  }
});

// GET /api/submissions/stats/by-difficulty
router.get('/stats/by-difficulty', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const results = await PracticeSubmission.aggregate([
      {
        $match: {
          userId: userId,
          difficulty: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$difficulty',
          totalSubmissions: { $sum: 1 },
          // Use verdict instead of status for logic - only PASSED counts as solved
          totalSolved: {
            $sum: {
              $cond: [{ $eq: ['$verdict', 'PASSED'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: results.map((r) => ({
        difficulty: r._id,
        totalSubmissions: r.totalSubmissions,
        totalSolved: r.totalSolved
      }))
    });
  } catch (error) {
    console.error('Error fetching stats by difficulty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch difficulty stats',
      error: error.message
    });
  }
});

// GET /api/submissions/stats/streak
// Calculate solving streak (consecutive days with at least one PASSED submission)
router.get('/stats/streak', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Get all submissions with verdict === 'PASSED', grouped by date
    const solvedByDate = await PracticeSubmission.aggregate([
      {
        $match: {
          userId: userId,
          verdict: 'PASSED' // Only count PASSED submissions for streak
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          solvedCount: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } } // Most recent first
    ]);

    // Calculate current streak (consecutive days with at least one PASSED submission)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (solvedByDate.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get unique dates (most recent first)
      const uniqueDates = [...new Set(solvedByDate.map(d => d._id))].sort().reverse();
      
      // Calculate current streak (consecutive days from most recent backwards)
      // Start from the most recent solved date
      const mostRecentDate = new Date(uniqueDates[0] + 'T00:00:00');
      const daysSinceMostRecent = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));
      
      // If most recent was today or yesterday, start counting from there
      if (daysSinceMostRecent <= 1) {
        let checkDate = new Date(mostRecentDate);
        let consecutiveDays = 0;
        
        // Count backwards from most recent date
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates.includes(dateStr)) {
            consecutiveDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        currentStreak = consecutiveDays;
      }
      
      // Calculate longest streak (any consecutive period in history)
      const sortedDates = uniqueDates.sort(); // Oldest to newest
      let prevDate = null;
      
      for (const dateStr of sortedDates) {
        const currentDate = new Date(dateStr + 'T00:00:00');
        
        if (prevDate === null) {
          tempStreak = 1;
        } else {
          const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            // Consecutive day
            tempStreak++;
          } else {
            // Gap found, update longest streak and reset
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        
        prevDate = currentDate;
      }
      
      // Don't forget the last streak
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    res.json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        lastSolvedDate: solvedByDate.length > 0 ? solvedByDate[0]._id : null
      }
    });
  } catch (error) {
    console.error('Error calculating streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate streak',
      error: error.message
    });
  }
});

// GET /api/submissions/list
router.get('/list', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const {
      topic,
      difficulty,
      language,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const match = {
      userId: userId
    };

    if (topic) {
      match.topics = topic;
    }

    if (difficulty) {
      match.difficulty = difficulty;
    }

    if (language) {
      match.language = language;
    }

    // Support filtering by verdict (new) or status (legacy)
    if (req.query.verdict) {
      match.verdict = req.query.verdict;
    } else if (status) {
      // Legacy status filter - map to verdict for consistency
      if (status === 'success') {
        match.verdict = 'PASSED';
      } else if (status === 'error') {
        match.$or = [
          { verdict: 'FAILED' },
          { verdict: 'COMPILE_ERROR' },
          { verdict: 'RUNTIME_ERROR' }
        ];
      }
    }

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        match.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        match.createdAt.$lte = new Date(endDate);
      }
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    const [data, total] = await Promise.all([
      PracticeSubmission.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      PracticeSubmission.countDocuments(match)
    ]);

    res.json({
      success: true,
      data,
      total,
      page: pageNumber,
      limit: limitNumber
    });
  } catch (error) {
    console.error('Error fetching submission list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// GET /api/submissions/latest?questionId=...&language=...
router.get('/latest', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { questionId, language } = req.query;

    if (!questionId || !language) {
      return res.status(400).json({
        success: false,
        message: 'questionId and language are required'
      });
    }

    const submission = await PracticeSubmission.findOne({
      userId: userId,
      questionId,
      language
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!submission) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching latest practice submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest submission',
      error: error.message
    });
  }
});

// GET /api/submissions
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const submissions = await PracticeSubmission.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching practice submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

module.exports = router;


