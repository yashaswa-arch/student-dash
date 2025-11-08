const express = require('express');
const router = express.Router();
const LeetCodeQuestion = require('../models/LeetCodeQuestion');
const { auth } = require('../middleware/auth');
const { scrapeLeetCodeProblem } = require('../services/leetcodeScraper');
const axios = require('axios');

// @route   POST /api/leetcode/fetch
// @desc    Fetch problem from LeetCode URL
// @access  Private
router.post('/fetch', auth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'Please provide a LeetCode URL' });
    }
    
    // Scrape problem details
    const problemData = await scrapeLeetCodeProblem(url);
    
    res.json({
      success: true,
      problem: {
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        problemUrl: url
      }
    });
    
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch problem from LeetCode' 
    });
  }
});

// @route   POST /api/leetcode/analyze
// @desc    Analyze user code with AI
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  try {
    const { code, language, problemTitle, problemDescription } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Please provide code to analyze' });
    }
    
    // Call AI service for analysis
    try {
      const aiResponse = await axios.post('http://localhost:8001/leetcode/analyze', {
        code,
        language: language || 'javascript',
        problemTitle: problemTitle || 'Unknown Problem',
        problemDescription: problemDescription || ''
      }, {
        timeout: 30000
      });
      
      const feedback = aiResponse.data;
      
      res.json({
        success: true,
        feedback: {
          timeComplexity: feedback.timeComplexity || 'Unknown',
          spaceComplexity: feedback.spaceComplexity || 'Unknown',
          mistakes: feedback.mistakes || [],
          missingEdgeCases: feedback.missingEdgeCases || [],
          improvements: feedback.improvements || [],
          bruteToOptimalSuggestions: feedback.bruteToOptimalSuggestions || [],
          hint: feedback.hint || 'Consider the constraints and look for patterns'
        }
      });
      
    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      
      // Fallback response if AI service is down
      res.json({
        success: true,
        feedback: {
          timeComplexity: 'Analysis unavailable',
          spaceComplexity: 'Analysis unavailable',
          mistakes: ['AI service temporarily unavailable'],
          missingEdgeCases: [],
          improvements: ['Try running the AI analysis again'],
          bruteToOptimalSuggestions: [],
          hint: 'AI service is currently offline. Please try again later.'
        }
      });
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze code' });
  }
});

// @route   POST /api/leetcode/save
// @desc    Save question with code and feedback
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const {
      title,
      problemUrl,
      difficulty,
      description,
      userCode,
      language,
      aiFeedback,
      userNotes,
      status
    } = req.body;
    
    if (!title || !problemUrl || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if question already exists for this user
    let question = await LeetCodeQuestion.findOne({
      user: req.user._id,
      problemUrl
    });
    
    if (question) {
      // Update existing question
      question.userCode = userCode || question.userCode;
      question.language = language || question.language;
      question.aiFeedback = aiFeedback || question.aiFeedback;
      question.userNotes = userNotes !== undefined ? userNotes : question.userNotes;
      question.status = status || question.status;
      await question.save();
      
      return res.json({
        success: true,
        message: 'Question updated successfully',
        question
      });
    }
    
    // Create new question
    question = new LeetCodeQuestion({
      user: req.user._id,
      title,
      problemUrl,
      difficulty,
      description,
      userCode: userCode || '',
      language: language || 'javascript',
      aiFeedback: aiFeedback || null,
      userNotes: userNotes || '',
      status: status || 'Attempted'
    });
    
    await question.save();
    
    res.json({
      success: true,
      message: 'Question saved successfully',
      question
    });
    
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: 'Failed to save question' });
  }
});

// @route   GET /api/leetcode/questions
// @desc    Get all saved questions for user
// @access  Private
router.get('/questions', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const questions = await LeetCodeQuestion.find(query)
      .sort({ updatedAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      questions
    });
    
  } catch (error) {
    console.error('Fetch questions error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// @route   GET /api/leetcode/questions/:id
// @desc    Get single question by ID
// @access  Private
router.get('/questions/:id', auth, async (req, res) => {
  try {
    const question = await LeetCodeQuestion.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({
      success: true,
      question
    });
    
  } catch (error) {
    console.error('Fetch question error:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// @route   PUT /api/leetcode/questions/:id
// @desc    Update question
// @access  Private
router.put('/questions/:id', auth, async (req, res) => {
  try {
    const question = await LeetCodeQuestion.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const { userCode, language, aiFeedback, userNotes, status } = req.body;
    
    if (userCode !== undefined) question.userCode = userCode;
    if (language) question.language = language;
    if (aiFeedback) question.aiFeedback = aiFeedback;
    if (userNotes !== undefined) question.userNotes = userNotes;
    if (status) question.status = status;
    
    await question.save();
    
    res.json({
      success: true,
      message: 'Question updated successfully',
      question
    });
    
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update question' });
  }
});

// @route   DELETE /api/leetcode/questions/:id
// @desc    Delete question
// @access  Private
router.delete('/questions/:id', auth, async (req, res) => {
  try {
    const question = await LeetCodeQuestion.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
});

module.exports = router;
