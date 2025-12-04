const express = require('express');
const router = express.Router();
const PracticeSubmission = require('../models/PracticeSubmission');

// POST /api/submissions
// Body: { userId, questionId, language, code, stdout, stderr, status }
router.post('/', async (req, res) => {
  try {
    const { userId, questionId, language, code, stdout, stderr, status } = req.body;

    if (!userId || !questionId || !language || !code || !status) {
      return res.status(400).json({
        success: false,
        message: 'userId, questionId, language, code and status are required'
      });
    }

    const submission = await PracticeSubmission.create({
      userId,
      questionId,
      language,
      code,
      stdout: stdout || '',
      stderr: stderr || '',
      status
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


