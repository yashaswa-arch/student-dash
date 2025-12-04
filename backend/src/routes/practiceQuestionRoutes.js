const express = require('express');
const router = express.Router();
const PracticeQuestion = require('../models/PracticeQuestion');
const { auth } = require('../middleware/auth');

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

module.exports = router;


