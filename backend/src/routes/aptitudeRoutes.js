const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { auth } = require('../middleware/auth');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const AptitudeAttempt = require('../models/AptitudeAttempt');

// @route   GET /api/aptitude/topics
// @desc    Get available topics
// @access  Private
router.get('/topics', auth, async (req, res) => {
  try {
    const topics = await AptitudeQuestion.distinct('topic', { isActive: true });
    
    res.json({
      success: true,
      topics: topics
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
});

// @route   GET /api/aptitude/questions
// @desc    Get random questions by topic and difficulty
// @access  Private
router.get('/questions', auth, async (req, res) => {
  try {
    const { topic, difficulty = 'easy', limit = 10 } = req.query;
    const limitNum = parseInt(limit, 10) || 10;

    // Build filter
    const filter = { isActive: true };
    if (topic) {
      filter.topic = topic;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Use aggregation with $sample for random selection
    const questions = await AptitudeQuestion.aggregate([
      { $match: filter },
      { $sample: { size: limitNum } },
      {
        $project: {
          _id: 1,
          topic: 1,
          subtopic: 1,
          questionText: 1,
          options: 1,
          difficulty: 1,
          explanation: 1,
          source: 1
          // Exclude correctIndex - frontend shouldn't see it
        }
      }
    ]);

    res.json({
      success: true,
      questions: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

// @route   POST /api/aptitude/attempts
// @desc    Create and evaluate an aptitude quiz attempt
// @access  Private
router.post('/attempts', auth, async (req, res) => {
  try {
    const { topic, difficulty, startedAt, responses } = req.body;

    // Validation
    if (!topic || !responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Topic and responses array are required'
      });
    }

    if (responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Responses array cannot be empty'
      });
    }

    // Extract question IDs from responses and convert to ObjectIds
    const questionIds = responses
      .map(r => r.questionId)
      .filter(Boolean)
      .map(id => {
        try {
          return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid question IDs found in responses'
      });
    }

    // Fetch all questions
    const questions = await AptitudeQuestion.find({
      _id: { $in: questionIds },
      isActive: true
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some question IDs are invalid or inactive'
      });
    }

    // Create a map for quick lookup
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    // Evaluate each response
    const answers = responses.map(response => {
      const question = questionMap[response.questionId];
      if (!question) {
        return {
          questionId: response.questionId,
          selectedIndex: response.selectedIndex !== undefined ? response.selectedIndex : -1,
          isCorrect: false,
          timeTakenSec: response.timeTakenSec || 0
        };
      }

      const selectedIndex = response.selectedIndex !== undefined && response.selectedIndex !== null 
        ? response.selectedIndex 
        : -1;
      const isCorrect = selectedIndex !== -1 && question.correctIndex === selectedIndex;

      return {
        questionId: response.questionId,
        selectedIndex: selectedIndex,
        isCorrect: isCorrect,
        timeTakenSec: response.timeTakenSec || 0
      };
    });

    // Calculate statistics
    const totalQuestions = answers.length;
    const correctCount = answers.filter(a => a.isCorrect).length;
    const incorrectCount = answers.filter(a => !a.isCorrect && a.selectedIndex !== -1).length;
    const skippedCount = answers.filter(a => a.selectedIndex === -1 || a.selectedIndex === null).length;
    const scorePercent = totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0;

    // Create attempt
    const attempt = new AptitudeAttempt({
      userId: req.user._id,
      topic: topic,
      difficulty: difficulty || null,
      questionIds: questionIds,
      answers: answers,
      totalQuestions: totalQuestions,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      skippedCount: skippedCount,
      scorePercent: scorePercent,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: new Date()
    });

    await attempt.save();

    // Build response with full question details using questionMap
    const attemptResponse = {
      _id: attempt._id,
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      skippedCount: attempt.skippedCount,
      scorePercent: attempt.scorePercent,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      answers: attempt.answers.map(answer => {
        const question = questionMap[answer.questionId.toString()];
        return {
          questionId: answer.questionId,
          questionText: question ? question.questionText : '',
          options: question ? question.options : [],
          correctIndex: question ? question.correctIndex : -1,
          selectedIndex: answer.selectedIndex,
          isCorrect: answer.isCorrect,
          explanation: question ? (question.explanation || '') : '',
          timeTakenSec: answer.timeTakenSec
        };
      })
    };

    res.status(201).json({
      success: true,
      attempt: attemptResponse
    });
  } catch (error) {
    console.error('Error creating attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating attempt',
      error: error.message
    });
  }
});

// @route   GET /api/aptitude/attempts/recent
// @desc    Get recent attempts for logged-in user
// @access  Private
router.get('/attempts/recent', auth, async (req, res) => {
  try {
    const attempts = await AptitudeAttempt.find({
      userId: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('topic scorePercent totalQuestions correctCount createdAt')
      .lean();

    res.json({
      success: true,
      attempts: attempts
    });
  } catch (error) {
    console.error('Error fetching recent attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent attempts',
      error: error.message
    });
  }
});

// @route   GET /api/aptitude/stats/summary
// @desc    Get topic-wise statistics for logged-in user
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate stats by topic
    const stats = await AptitudeAttempt.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $group: {
          _id: '$topic',
          attemptsCount: { $sum: 1 },
          avgScorePercent: { $avg: '$scorePercent' },
          bestScorePercent: { $max: '$scorePercent' },
          lastAttemptDate: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          attemptsCount: 1,
          avgScorePercent: { $round: ['$avgScorePercent', 2] },
          bestScorePercent: 1,
          lastAttemptDate: 1
        }
      },
      {
        $sort: { topic: 1 }
      }
    ]);

    res.json({
      success: true,
      topics: stats
    });
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats summary',
      error: error.message
    });
  }
});

module.exports = router;
