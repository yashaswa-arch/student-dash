const express = require('express');
const router = express.Router();
const PracticeQuestion = require('../models/PracticeQuestion');
const { auth } = require('../middleware/auth');
const codeExecutionService = require('../services/codeExecutionService');

// GET /api/practice-questions
// Optional query: topic, difficulty
router.get('/', auth, async (req, res) => {
  try {
    const { topic, difficulty } = req.query;

    const query = {};
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const questions = await PracticeQuestion.find(query).sort({ order: 1 });

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch practice questions',
      error: error.message
    });
  }
});

// GET /api/practice-questions/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await PracticeQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching practice question by id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question',
      error: error.message
    });
  }
});

// GET /api/practice-questions/by-order/:order
router.get('/by-order/:order', auth, async (req, res) => {
  try {
    const order = parseInt(req.params.order, 10);

    const question = await PracticeQuestion.findOne({ order });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching practice question by order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch question',
      error: error.message
    });
  }
});

// POST /api/practice-questions/:id/submit
// Submit code for evaluation against all test cases
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    const questionId = req.params.id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'code and language are required'
      });
    }

    // Fetch the question with all test cases
    const question = await PracticeQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Collect all test cases: sample + hidden
    const allTestCases = [];
    
    // Add sample test case (from sampleInput/sampleOutput)
    if (question.sampleInput && question.sampleOutput) {
      allTestCases.push({
        input: question.sampleInput,
        expectedOutput: question.sampleOutput,
        isHidden: false
      });
    }

    // Add hidden test cases (from testCases array)
    if (question.testCases && Array.isArray(question.testCases)) {
      question.testCases.forEach(tc => {
        if (tc.input && tc.expectedOutput) {
          allTestCases.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden || false
          });
        }
      });
    }

    if (allTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No test cases available for this question'
      });
    }

    // Execute code against all test cases
    let executionResult;
    try {
      executionResult = await codeExecutionService.submitCode({
        code,
        language: language.toLowerCase(),
        testCases: allTestCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput
        }))
      });
    } catch (execError) {
      console.error('Code execution error:', execError);
      return res.status(500).json({
        success: false,
        message: 'Code execution failed',
        error: execError.message,
        verdict: 'RUNTIME_ERROR',
        passedTests: 0,
        totalTests: allTestCases.length
      });
    }

    // Determine verdict based on execution results
    let verdict = 'PENDING';
    const passedTests = executionResult.passedTests || 0;
    const totalTests = executionResult.totalTests || allTestCases.length;
    const status = executionResult.status || 'unknown';

    // Check for compilation errors first (highest priority)
    if (status === 'compilation_error' || 
        status.includes('compilation') ||
        executionResult.compilationOutput) {
      verdict = 'COMPILE_ERROR';
    }
    // Check for runtime errors (second priority)
    else if (status === 'runtime_error' || 
             status.includes('runtime') ||
             status === 'runtime_error_sigsegv' ||
             status === 'runtime_error_sigxfsz' ||
             status === 'runtime_error_sigfpe' ||
             status === 'runtime_error_sigabrt' ||
             status === 'runtime_error_nzec' ||
             status === 'runtime_error_other') {
      verdict = 'RUNTIME_ERROR';
    }
    // Check if all tests passed
    else if (passedTests === totalTests && totalTests > 0) {
      verdict = 'PASSED';
    }
    // Some tests failed
    else if (passedTests < totalTests && passedTests >= 0) {
      verdict = 'FAILED';
    }
    // Default to failed if unclear
    else {
      verdict = 'FAILED';
    }

    // Get stdout/stderr from first test result (or compilation error)
    const firstTestResult = executionResult.testResults?.[0];
    const stdout = firstTestResult?.actualOutput || executionResult.runtimeOutput || '';
    const stderr = executionResult.compilationOutput || firstTestResult?.errorMessage || executionResult.runtimeOutput || '';

    res.json({
      success: true,
      verdict,
      passedTests,
      totalTests,
      testResults: executionResult.testResults || [],
      executionTime: executionResult.executionTime || 0,
      memoryUsage: executionResult.memoryUsage || 0,
      stdout,
      stderr,
      status: executionResult.status
    });
  } catch (error) {
    console.error('Error submitting practice question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution',
      error: error.message
    });
  }
});

module.exports = router;


