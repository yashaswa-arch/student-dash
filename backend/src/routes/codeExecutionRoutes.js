const express = require('express');
const router = express.Router();
const codeExecutionService = require('../services/codeExecutionService');
const { Submission, CodingQuestion, Lesson, Quiz, Progress } = require('../models');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/code-execution/submit
 * @desc    Submit code for execution
 * @access  Private
 */
router.post('/submit', auth, async (req, res) => {
  try {
    const {
      code,
      language,
      codingQuestionId,
      lessonId,
      quizId,
      input = '',
      timeLimit = 5,
      memoryLimit = 128000
    } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    // Get test cases based on content type
    let testCases = [];
    let expectedOutput = '';
    let contentContext = null;

    if (codingQuestionId) {
      const question = await CodingQuestion.findById(codingQuestionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Coding question not found'
        });
      }
      testCases = question.testCases || [];
      contentContext = { type: 'coding_question', id: codingQuestionId };
    } else if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }
      if (lesson.type === 'code' && lesson.content.testCases) {
        testCases = lesson.content.testCases;
        expectedOutput = lesson.content.expectedOutput || '';
      }
      contentContext = { type: 'lesson', id: lessonId };
    } else if (quizId) {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      contentContext = { type: 'quiz', id: quizId };
    }

    // Execute code
    console.log(`🚀 Executing ${language} code`);
    const executionResult = await codeExecutionService.submitCode({
      code,
      language,
      input,
      expectedOutput,
      timeLimit,
      memoryLimit,
      testCases
    });

    // Save submission to database
    const submission = new Submission({
      user: req.user._id, // Use authenticated user ID
      code,
      language,
      status: executionResult.status,
      score: executionResult.score,
      executionTime: executionResult.executionTime,
      memoryUsage: executionResult.memoryUsage,
      testResults: executionResult.testResults,
      compilationOutput: executionResult.compilationOutput,
      runtimeOutput: executionResult.runtimeOutput,
      ...(codingQuestionId && { codingQuestion: codingQuestionId }),
      ...(lessonId && { lesson: lessonId }),
      ...(quizId && { quiz: quizId })
    });

    await submission.save();

    res.json({
      success: true,
      message: 'Code executed successfully',
      data: {
        submissionId: submission._id,
        status: executionResult.status,
        score: executionResult.score,
        executionTime: executionResult.executionTime,
        memoryUsage: executionResult.memoryUsage,
        testResults: executionResult.testResults,
        totalTests: executionResult.totalTests,
        passedTests: executionResult.passedTests,
        compilationOutput: executionResult.compilationOutput,
        runtimeOutput: executionResult.runtimeOutput
      }
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/code-execution/languages
 * @desc    Get supported programming languages
 * @access  Public
 */
router.get('/languages', (req, res) => {
  try {
    const languages = codeExecutionService.getSupportedLanguages().map(lang => {
      return codeExecutionService.getLanguageInfo(lang);
    });

    res.json({
      success: true,
      data: languages
    });

  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supported languages'
    });
  }
});

/**
 * @route   POST /api/code-execution/quick-run
 * @desc    Quick code execution without saving to database
 * @access  Private
 */
router.post('/quick-run', auth, async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    console.log(`🏃 Quick run: ${language} code`);
    const result = await codeExecutionService.submitCode({
      code,
      language,
      input,
      timeLimit: 5,
      memoryLimit: 128000
    });

    res.json({
      success: true,
      message: 'Code executed successfully',
      data: result
    });

  } catch (error) {
    console.error('Quick run error:', error);
    res.status(500).json({
      success: false,
      message: 'Quick execution failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Execution error'
    });
  }
});

/**
 * @route   GET /api/code-execution/submissions
 * @desc    Get user's code submissions
 * @access  Private
 */
router.get('/submissions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    
    // Filter by language if specified
    if (req.query.language) {
      query.language = req.query.language;
    }
    
    // Filter by status if specified
    if (req.query.status) {
      query.status = req.query.status;
    }

    const submissions = await Submission.find(query)
      .populate('codingQuestion', 'title difficulty')
      .populate('lesson', 'title')
      .populate('quiz', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions'
    });
  }
});

module.exports = router;