const express = require('express');
const mongoose = require('mongoose');
const Transcript = require('../models/Transcript');
const InterviewAttempt = require('../models/InterviewAttempt');
const { auth, authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/transcripts
// @desc    Get transcripts (own transcripts for students, all for admin)
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

    if (req.query.attemptId) {
      query.attempt = req.query.attemptId;
    }

    const transcripts = await Transcript.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'attempt',
        populate: {
          path: 'question',
          select: 'title difficulty'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transcript.countDocuments(query);

    res.json({
      success: true,
      data: {
        transcripts,
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
      message: 'Error fetching transcripts',
      error: error.message
    });
  }
});

// @route   POST /api/transcripts
// @desc    Create a new transcript
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { attempt, audioUrl, transcriptText, durationSec } = req.body;

    // Validate required fields
    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: 'Interview attempt ID is required'
      });
    }

    // Verify attempt exists and belongs to user (for students)
    const interviewAttempt = await InterviewAttempt.findById(attempt);
    if (!interviewAttempt) {
      return res.status(404).json({
        success: false,
        message: 'Interview attempt not found'
      });
    }

    // Students can only create transcripts for their own attempts
    if (req.user.role === 'student' && interviewAttempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const transcript = await Transcript.create({
      user: req.user._id,
      attempt,
      audioUrl: audioUrl || null,
      transcriptText: transcriptText || null,
      durationSec: durationSec || null
    });

    await transcript.populate([
      { path: 'user', select: 'name email' },
      {
        path: 'attempt',
        populate: {
          path: 'question',
          select: 'title difficulty'
        }
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Transcript created successfully',
      data: { transcript }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transcript',
      error: error.message
    });
  }
});

// @route   GET /api/transcripts/:id
// @desc    Get transcript by ID
// @access  Private
router.get('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'attempt',
        populate: {
          path: 'question',
          select: 'title difficulty statement'
        }
      });

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found'
      });
    }

    // Students can only view their own transcripts
    if (req.user.role === 'student' && transcript.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { transcript }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transcript',
      error: error.message
    });
  }
});

// @route   PUT /api/transcripts/:id
// @desc    Update transcript
// @access  Private
router.put('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    let transcript = await Transcript.findById(req.params.id);

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found'
      });
    }

    // Students can only update their own transcripts
    if (req.user.role === 'student' && transcript.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { audioUrl, transcriptText, durationSec } = req.body;
    const updateData = {};

    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (transcriptText !== undefined) updateData.transcriptText = transcriptText;
    if (durationSec !== undefined) updateData.durationSec = durationSec;

    transcript = await Transcript.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name email' },
      {
        path: 'attempt',
        populate: {
          path: 'question',
          select: 'title difficulty'
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Transcript updated successfully',
      data: { transcript }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transcript',
      error: error.message
    });
  }
});

// @route   DELETE /api/transcripts/:id
// @desc    Delete transcript
// @access  Private
router.delete('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id);

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found'
      });
    }

    // Students can only delete their own transcripts, admins can delete any
    if (req.user.role === 'student' && transcript.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Transcript.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transcript deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transcript',
      error: error.message
    });
  }
});

// @route   GET /api/transcripts/attempt/:attemptId
// @desc    Get transcript for a specific attempt
// @access  Private
router.get('/attempt/:attemptId', auth, validateObjectId('attemptId'), async (req, res) => {
  try {
    const { attemptId } = req.params;

    // Verify attempt exists and user has access
    const attempt = await InterviewAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Interview attempt not found'
      });
    }

    // Students can only access transcripts for their own attempts
    if (req.user.role === 'student' && attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const transcript = await Transcript.findOne({ attempt: attemptId })
      .populate('user', 'name email')
      .populate({
        path: 'attempt',
        populate: {
          path: 'question',
          select: 'title difficulty'
        }
      });

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found for this attempt'
      });
    }

    res.json({
      success: true,
      data: { transcript }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transcript',
      error: error.message
    });
  }
});

// @route   GET /api/transcripts/user/:userId/stats
// @desc    Get user's transcript statistics (admin only or own stats)
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

    const stats = await Transcript.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTranscripts: { $sum: 1 },
          totalDuration: { $sum: '$durationSec' },
          avgDuration: { $avg: '$durationSec' },
          transcriptsWithText: {
            $sum: {
              $cond: [{ $ne: ['$transcriptText', null] }, 1, 0]
            }
          },
          transcriptsWithAudio: {
            $sum: {
              $cond: [{ $ne: ['$audioUrl', null] }, 1, 0]
            }
          }
        }
      }
    ]);

    const recentTranscripts = await Transcript.find({ user: userId })
      .populate({
        path: 'attempt',
        populate: {
          path: 'question',
          select: 'title difficulty'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTranscripts: 0,
          totalDuration: 0,
          avgDuration: 0,
          transcriptsWithText: 0,
          transcriptsWithAudio: 0
        },
        recentTranscripts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transcript statistics',
      error: error.message
    });
  }
});

module.exports = router;