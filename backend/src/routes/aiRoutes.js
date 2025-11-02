/**
 * AI Code Intelligence Integration Routes
 * Routes for integrating with the Python AI microservice
 */

const express = require('express');
const axios = require('axios');
const { auth, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body, param } = require('express-validator');

const router = express.Router();

// AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AI_SERVICE_TIMEOUT = 30000; // 30 seconds

/**
 * @route POST /api/ai/analyze
 * @desc Analyze code using AI service
 * @access Private
 */
router.post('/analyze', 
  auth,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin']).withMessage('Invalid language'),
    body('context').optional().isString(),
    body('include_suggestions').optional().isBoolean(),
    body('include_ai_analysis').optional().isBoolean(),
    body('include_recommendations').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, language, context, include_suggestions = true, include_ai_analysis = true, include_recommendations = true } = req.body;
      const user = req.user;

      // Prepare request for AI service
      const aiRequest = {
        code,
        language,
        context,
        skill_level: user.skillLevel || 'beginner',
        include_suggestions,
        include_ai_analysis,
        include_recommendations,
        user_id: user.userId || 'demo_user'
      };

      // Forward request to AI service (NO AUTH REQUIRED)
      const response = await axios.post(`${AI_SERVICE_URL}/analyze`, aiRequest, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: AI_SERVICE_TIMEOUT
      });

      // Store analysis result (optional)
      // You could save this to MongoDB for tracking
      
      res.json({
        success: true,
        data: response.data,
        message: 'Code analysis completed successfully'
      });

    } catch (error) {
      console.error('AI analysis error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'AI analysis service is currently unavailable'
        });
      }

      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed with AI service'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to analyze code',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/ai/quick-analysis
 * @desc Quick code quality assessment
 * @access Private
 */
router.post('/quick-analysis',
  auth,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin']).withMessage('Invalid language')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, language } = req.body;

      const response = await axios.post(`${AI_SERVICE_URL}/quick-analysis`, {
        code,
        language
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Shorter timeout for quick analysis
      });

      res.json({
        success: true,
        data: response.data,
        message: 'Quick analysis completed'
      });

    } catch (error) {
      console.error('Quick analysis error:', error.message);
      
      res.status(error.response?.status || 500).json({
        success: false,
        message: 'Quick analysis failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/ai/recommendations/:userId
 * @desc Get personalized learning recommendations
 * @access Private
 */
router.get('/recommendations/:userId',
  auth,
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUser = req.user;

      // Check authorization - users can only see their own recommendations unless admin/instructor
      if (requestingUser.userId !== userId && !['admin', 'instructor'].includes(requestingUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const response = await axios.get(`${AI_SERVICE_URL}/recommendations/${userId}`, {
        headers: {
          'Authorization': req.headers.authorization
        },
        timeout: 10000
      });

      res.json({
        success: true,
        data: response.data,
        message: 'Recommendations retrieved successfully'
      });

    } catch (error) {
      console.error('Recommendations error:', error.message);
      
      res.status(error.response?.status || 500).json({
        success: false,
        message: 'Failed to get recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/ai/languages
 * @desc Get supported programming languages
 * @access Private
 */
router.get('/languages',
  auth,
  async (req, res) => {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/languages`, {
        timeout: 5000
      });

      res.json({
        success: true,
        data: response.data,
        message: 'Supported languages retrieved'
      });

    } catch (error) {
      console.error('Languages error:', error.message);
      
      res.status(error.response?.status || 500).json({
        success: false,
        message: 'Failed to get supported languages',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/ai/health
 * @desc Check AI service health
 * @access Private (Admin only)
 */
router.get('/health',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, {
        timeout: 5000
      });

      res.json({
        success: true,
        data: response.data,
        message: 'AI service health check completed'
      });

    } catch (error) {
      console.error('AI health check error:', error.message);
      
      res.status(503).json({
        success: false,
        message: 'AI service health check failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/ai/explain-code
 * @desc Get AI explanation of code
 * @access Private
 */
router.post('/explain-code',
  auth,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go', 'rust']).withMessage('Invalid language')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, language } = req.body;

      const response = await axios.post(`${AI_SERVICE_URL}/explain-code`, {
        code,
        language
      }, {
        headers: {
          'Authorization': req.headers.authorization,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      });

      res.json({
        success: true,
        data: {
          explanation: response.data
        },
        message: 'Code explanation generated'
      });

    } catch (error) {
      console.error('Code explanation error:', error.message);
      
      res.status(error.response?.status || 500).json({
        success: false,
        message: 'Failed to explain code',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/ai/suggest-improvements
 * @desc Get AI suggestions for code improvements
 * @access Private
 */
router.post('/suggest-improvements',
  auth,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go', 'rust']).withMessage('Invalid language'),
    body('skill_level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid skill level')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, language, skill_level = 'beginner' } = req.body;

      const response = await axios.post(`${AI_SERVICE_URL}/suggest-improvements`, {
        code,
        language,
        skill_level
      }, {
        headers: {
          'Authorization': req.headers.authorization,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      });

      res.json({
        success: true,
        data: {
          suggestions: response.data
        },
        message: 'Improvement suggestions generated'
      });

    } catch (error) {
      console.error('Improvement suggestions error:', error.message);
      
      res.status(error.response?.status || 500).json({
        success: false,
        message: 'Failed to generate suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/ai/detect-bugs
 * @desc Detect potential bugs in code using AI
 * @access Private
 */
router.post('/detect-bugs',
  auth,
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go', 'rust']).withMessage('Invalid language')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, language } = req.body;

      const response = await axios.post(`${AI_SERVICE_URL}/detect-bugs`, {
        code,
        language
      }, {
        headers: {
          'Authorization': req.headers.authorization,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      });

      res.json({
        success: true,
        data: {
          bugs: response.data
        },
        message: 'Bug detection completed'
      });

    } catch (error) {
      console.error('Bug detection error:', error.message);
      
      res.status(error.response?.status || 500).json({
        success: false,
        message: 'Bug detection failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;