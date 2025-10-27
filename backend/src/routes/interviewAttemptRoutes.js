const express = require('express');
const mongoose = require('mongoose');
const InterviewAttempt = require('../models/InterviewAttempt');
const CodingQuestion = require('../models/CodingQuestion');
const { auth, authorize } = require('../middleware/auth');
const { validateInterviewAttempt, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/attempts
// @desc    Get interview attempts (own attempts for students, all for admin)
// @access  Private
router.get('/', auth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on user role
    const query = {};
    if (req.user.role === 'student') {
      query.user = req.user._id;
    } else if (req.query.userId && req.user.role === 'admin') {
      query.user = req.query.userId;
    }

    if (req.query.questionId) {
      query.question = req.query.questionId;
    }

    const attempts = await InterviewAttempt.find(query)
      .populate('user', 'name email')
      .populate('question', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InterviewAttempt.countDocuments(query);

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attempts',
      error: error.message
    });
  }
});

// @route   POST /api/attempts
// @desc    Create a new interview attempt
// @access  Private
router.post('/', auth, validateInterviewAttempt, async (req, res) => {
  try {
    const { question, score, durationSec, transcript, emotionMetrics, metadata } = req.body;

    // Verify question exists
    const codingQuestion = await CodingQuestion.findById(question);
    if (!codingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const attempt = await InterviewAttempt.create({
      user: req.user._id,
      question,
      score: score || null,
      durationSec: durationSec || null,
      transcript: transcript || null,
      emotionMetrics: emotionMetrics || {},
      metadata: metadata || {}
    });

    await attempt.populate([
      { path: 'user', select: 'name email' },
      { path: 'question', select: 'title difficulty' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Interview attempt created successfully',
      data: { attempt }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating attempt',
      error: error.message
    });
  }
});

// @route   GET /api/attempts/:id
// @desc    Get interview attempt by ID
// @access  Private
router.get('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    const attempt = await InterviewAttempt.findById(req.params.id)
      .populate('user', 'name email')
      .populate('question', 'title difficulty statement');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Students can only view their own attempts
    if (req.user.role === 'student' && attempt.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { attempt }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attempt',
      error: error.message
    });
  }
});

// @route   PUT /api/attempts/:id
// @desc    Update interview attempt
// @access  Private
router.put('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    let attempt = await InterviewAttempt.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Students can only update their own attempts
    if (req.user.role === 'student' && attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { score, durationSec, transcript, emotionMetrics, metadata } = req.body;
    const updateData = {};

    if (score !== undefined) updateData.score = score;
    if (durationSec !== undefined) updateData.durationSec = durationSec;
    if (transcript !== undefined) updateData.transcript = transcript;
    if (emotionMetrics !== undefined) updateData.emotionMetrics = emotionMetrics;
    if (metadata !== undefined) updateData.metadata = metadata;

    attempt = await InterviewAttempt.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name email' },
      { path: 'question', select: 'title difficulty' }
    ]);

    res.json({
      success: true,
      message: 'Attempt updated successfully',
      data: { attempt }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating attempt',
      error: error.message
    });
  }
});

// @route   DELETE /api/attempts/:id
// @desc    Delete interview attempt
// @access  Private
router.delete('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    const attempt = await InterviewAttempt.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Students can only delete their own attempts, admins can delete any
    if (req.user.role === 'student' && attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await InterviewAttempt.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Attempt deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting attempt',
      error: error.message
    });
  }
});

// @route   GET /api/attempts/user/:userId/stats
// @desc    Get user's attempt statistics
// @access  Private
router.get('/user/:userId/stats', auth, validateObjectId('userId'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Students can only view their own stats
    if (req.user.role === 'student' && userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await InterviewAttempt.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'codingquestions',
          localField: 'question',
          foreignField: '_id',
          as: 'questionDetails'
        }
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          totalTimeSpent: { $sum: '$durationSec' },
          difficultyStats: {
            $push: {
              difficulty: { $arrayElemAt: ['$questionDetails.difficulty', 0] },
              score: '$score'
            }
          }
        }
      }
    ]);

    const difficultyBreakdown = await InterviewAttempt.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'codingquestions',
          localField: 'question',
          foreignField: '_id',
          as: 'questionDetails'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$questionDetails.difficulty', 0] },
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    const recentAttempts = await InterviewAttempt.find({ user: userId })
      .populate('question', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalAttempts: 0,
          averageScore: 0,
          totalTimeSpent: 0
        },
        difficultyBreakdown,
        recentAttempts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

// @route   GET /api/attempts/question/:questionId/stats
// @desc    Get question attempt statistics (instructor/admin only)
// @access  Private/Instructor/Admin
router.get('/question/:questionId/stats', auth, authorize('instructor', 'admin'), validateObjectId('questionId'), async (req, res) => {
  try {
    const { questionId } = req.params;

    const stats = await InterviewAttempt.aggregate([
      { $match: { question: new mongoose.Types.ObjectId(questionId) } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          minScore: { $min: '$score' },
          maxScore: { $max: '$score' },
          averageDuration: { $avg: '$durationSec' }
        }
      }
    ]);

    const scoreDistribution = await InterviewAttempt.aggregate([
      { $match: { question: new mongoose.Types.ObjectId(questionId) } },
      {
        $bucket: {
          groupBy: '$score',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalAttempts: 0,
          averageScore: 0,
          minScore: 0,
          maxScore: 0,
          averageDuration: 0
        },
        scoreDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching question statistics',
      error: error.message
    });
  }
});

module.exports = router;