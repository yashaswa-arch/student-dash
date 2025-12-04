const express = require('express');
const router = express.Router();
const codeExecutionService = require('../services/codeExecutionService');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * @route   POST /api/execute
 * @desc    Execute code and return output
 * @access  Private
 */
router.post('/execute',
  auth,
  [
    body('language')
      .isIn(['java', 'cpp', 'python', 'javascript'])
      .withMessage('Language must be java, cpp, python, or javascript'),
    body('code')
      .notEmpty()
      .withMessage('Code is required'),
    body('stdin')
      .optional()
      .isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { language, code, stdin = '' } = req.body;

      console.log(`🚀 Executing ${language} code`);

      // Execute code using the existing code execution service
      const executionResult = await codeExecutionService.submitCode({
        code,
        language,
        input: stdin,
        timeLimit: 10, // 10 seconds timeout
        memoryLimit: 256000 // 256 MB
      });

      // Determine high-level status
      const isSuccess = executionResult.status === 'accepted' || executionResult.status === 'success';
      let stdout = '';
      let stderr = '';
      let status = isSuccess ? 'success' : 'error';

      // Prefer test case output for stdout
      if (executionResult.testResults && executionResult.testResults.length > 0) {
        stdout = executionResult.testResults[0].actualOutput || '';
      } else if (executionResult.runtimeOutput) {
        stdout = executionResult.runtimeOutput || '';
      }

      // Only treat compilation/runtime output as error when Judge0 reports a failure
      if (!isSuccess) {
        if (executionResult.runtimeOutput) {
          stderr = executionResult.runtimeOutput;
        } else if (executionResult.compilationOutput) {
          stderr = executionResult.compilationOutput;
        } else if (executionResult.testResults && executionResult.testResults.length > 0) {
          stderr = executionResult.testResults[0].errorMessage || 'Execution failed';
        } else {
          stderr = 'Execution failed';
        }
      }

      // If no output but status is success, show a friendly message
      if (isSuccess && !stdout && !stderr) {
        stdout = 'Code executed successfully (no output)';
      }

      res.json({
        success: true,
        data: {
          stdout,
          stderr,
          status
        }
      });

    } catch (error) {
      console.error('Code execution error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Code execution failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        data: {
          stdout: '',
          stderr: error.message || 'Execution failed',
          status: 'error'
        }
      });
    }
  }
);

module.exports = router;

