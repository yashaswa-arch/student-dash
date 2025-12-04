const express = require('express');
const router = express.Router();
const PracticeSubmission = require('../models/PracticeSubmission');

// POST /api/submissions
// Body: {
//   userId, questionId, language, code, stdout, stderr, status,
//   questionTitle, topics, difficulty, timeTakenInMinutes, source
// }
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      questionId,
      language,
      code,
      stdout,
      stderr,
      status,
      questionTitle,
      topics,
      difficulty,
      timeTakenInMinutes,
      source
    } = req.body;

    // Base validation (backwards compatible)
    if (!userId || !questionId || !language || !code || !status) {
      return res.status(400).json({
        success: false,
        message: 'userId, questionId, language, code and status are required'
      });
    }

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
      status,
      timeTakenInMinutes,
      source: normalizedSource
    });

    res.status(201).json({
      success: true,
      data: submission
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
router.get('/stats/overview', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [stats] = await PracticeSubmission.aggregate([
      { $match: { userId: String(userId) } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          totalSolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
            }
          },
          attemptedButUnsolved: {
            $sum: {
              $cond: [{ $ne: ['$status', 'success'] }, 1, 0]
            }
          },
          solvedLast7Days: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'success'] },
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
router.get('/stats/by-topic', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const results = await PracticeSubmission.aggregate([
      { $match: { userId: String(userId), topics: { $exists: true, $ne: [] } } },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          totalSubmissions: { $sum: 1 },
          totalSolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
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
router.get('/stats/by-difficulty', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const results = await PracticeSubmission.aggregate([
      {
        $match: {
          userId: String(userId),
          difficulty: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$difficulty',
          totalSubmissions: { $sum: 1 },
          totalSolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
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

// GET /api/submissions/list
router.get('/list', async (req, res) => {
  try {
    const {
      userId,
      topic,
      difficulty,
      language,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const match = {
      userId: String(userId)
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

    if (status) {
      match.status = status;
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

// GET /api/submissions/latest?userId=...&questionId=...&language=...
router.get('/latest', async (req, res) => {
  try {
    const { userId, questionId, language } = req.query;

    if (!userId || !questionId || !language) {
      return res.status(400).json({
        success: false,
        message: 'userId, questionId and language are required'
      });
    }

    const submission = await PracticeSubmission.findOne({
      userId,
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

// GET /api/submissions?userId=...
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const submissions = await PracticeSubmission.find({ userId })
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


