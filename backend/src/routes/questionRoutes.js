const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');
const axios = require('axios');

// @route   GET /api/questions
// @desc    Get all questions for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      difficulty,
      platform,
      topic,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    if (platform) query.platform = platform;
    if (topic) query.topics = topic;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const questions = await Question.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-submissions.code'); // Don't send code in list view

    const count = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/questions/stats
// @desc    Get user's question statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Question.getUserStats(req.user._id);
    
    // Get topic-wise stats
    const topicStats = await Question.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      ...stats,
      topicStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question with all details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/questions
// @desc    Create new question
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const question = new Question({
      ...req.body,
      user: req.user._id
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'user' && key !== 'submissions') {
        question[key] = req.body[key];
      }
    });

    await question.save();
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/questions/:id/submit
// @desc    Submit solution with code and run test cases + AI analysis
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Run test cases (if any)
    let testResults = [];
    let testCasesPassed = 0;
    
    if (question.testCases && question.testCases.length > 0) {
      // TODO: Integrate with code execution service
      // For now, mark as placeholder
      testResults = question.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'Execution pending',
        isPassed: false
      }));
    }

    // Get AI analysis
    let aiAnalysis = null;
    try {
      const aiResponse = await axios.post('http://localhost:8001/api/analyze', {
        code,
        language
      });
      
      aiAnalysis = {
        score: aiResponse.data.score || 0,
        timeComplexity: aiResponse.data.complexity?.time || 'Unknown',
        spaceComplexity: aiResponse.data.complexity?.space || 'Unknown',
        securityIssues: aiResponse.data.issues?.filter(i => i.category === 'security') || [],
        performanceIssues: aiResponse.data.issues?.filter(i => i.category === 'performance') || [],
        codeSmells: aiResponse.data.issues?.filter(i => i.category === 'quality') || [],
        suggestions: aiResponse.data.suggestions || [],
        betterApproach: aiResponse.data.betterApproach || '',
        explanation: aiResponse.data.explanation || ''
      };
    } catch (aiError) {
      console.error('AI analysis error:', aiError.message);
      // Continue without AI analysis
    }

    // Create submission
    const submission = {
      code,
      language,
      status: testCasesPassed === question.testCases.length && question.testCases.length > 0 ? 'passed' : 'failed',
      testCasesPassed,
      totalTestCases: question.testCases.length,
      aiAnalysis,
      submittedAt: new Date()
    };

    question.submissions.push(submission);
    question.updateStatus();
    
    await question.save();

    res.json({
      message: 'Solution submitted successfully',
      submission: question.submissions[question.submissions.length - 1],
      testResults,
      status: question.status
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/questions/:id/run-tests
// @desc    Run test cases without saving submission
// @access  Private
router.post('/:id/run-tests', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.testCases || question.testCases.length === 0) {
      return res.status(400).json({ message: 'No test cases available' });
    }

    // TODO: Integrate with actual code execution service
    // For now, return placeholder results
    const results = question.testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: 'Execution pending',
      isPassed: false
    }));

    res.json({
      results,
      passed: 0,
      total: question.testCases.length
    });
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/questions/:id/add-test
// @desc    Add test case to question
// @access  Private
router.post('/:id/add-test', auth, async (req, res) => {
  try {
    const { input, expectedOutput } = req.body;

    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.testCases.push({ input, expectedOutput });
    await question.save();

    res.json(question);
  } catch (error) {
    console.error('Error adding test case:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/questions/:id/submissions
// @desc    Get all submissions for a question
// @access  Private
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('submissions');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question.submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
