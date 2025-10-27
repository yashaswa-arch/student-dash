const express = require('express');
const CodingQuestion = require('../models/CodingQuestion');
const { auth, authorize } = require('../middleware/auth');
const { validateCodingQuestion, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all coding questions
// @access  Private
router.get('/', auth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { statement: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const questions = await CodingQuestion.find(query)
      .select('-testCases') // Exclude test cases for security
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CodingQuestion.countDocuments(query);

    res.json({
      success: true,
      data: {
        questions,
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
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new coding question
// @access  Private/Instructor/Admin
router.post('/', auth, authorize('instructor', 'admin'), validateCodingQuestion, async (req, res) => {
  try {
    const { title, statement, difficulty, tags, testCases } = req.body;

    const question = await CodingQuestion.create({
      title,
      statement,
      difficulty,
      tags: tags || [],
      testCases: testCases || []
    });

    res.status(201).json({
      success: true,
      message: 'Coding question created successfully',
      data: { question }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get coding question by ID
// @access  Private
router.get('/:id', auth, validateObjectId('id'), async (req, res) => {
  try {
    // Students see question without test cases, instructors/admins see everything
    const selectFields = req.user.role === 'student' ? '-testCases' : '';
    
    const question = await CodingQuestion.findById(req.params.id).select(selectFields);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: { question }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
});

// @route   GET /api/questions/:id/test-cases
// @desc    Get test cases for a question (instructor/admin only)
// @access  Private/Instructor/Admin
router.get('/:id/test-cases', auth, authorize('instructor', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const question = await CodingQuestion.findById(req.params.id).select('testCases title');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: { 
        questionTitle: question.title,
        testCases: question.testCases 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test cases',
      error: error.message
    });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update coding question
// @access  Private/Instructor/Admin
router.put('/:id', auth, authorize('instructor', 'admin'), validateObjectId('id'), validateCodingQuestion, async (req, res) => {
  try {
    const { title, statement, difficulty, tags, testCases } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (statement) updateData.statement = statement;
    if (difficulty) updateData.difficulty = difficulty;
    if (tags) updateData.tags = tags;
    if (testCases) updateData.testCases = testCases;

    const question = await CodingQuestion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete coding question
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const question = await CodingQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
});

// @route   GET /api/questions/random/:difficulty
// @desc    Get a random question by difficulty
// @access  Private
router.get('/random/:difficulty', auth, async (req, res) => {
  try {
    const { difficulty } = req.params;
    
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level'
      });
    }

    const questions = await CodingQuestion.aggregate([
      { $match: { difficulty } },
      { $sample: { size: 1 } },
      { $project: { testCases: 0 } } // Exclude test cases for students
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for difficulty: ${difficulty}`
      });
    }

    res.json({
      success: true,
      data: { question: questions[0] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random question',
      error: error.message
    });
  }
});

// @route   GET /api/questions/stats/overview
// @desc    Get question statistics
// @access  Private/Instructor/Admin
router.get('/stats/overview', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const totalQuestions = await CodingQuestion.countDocuments();
    
    const questionsByDifficulty = await CodingQuestion.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    const popularTags = await CodingQuestion.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalQuestions,
        questionsByDifficulty,
        popularTags
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