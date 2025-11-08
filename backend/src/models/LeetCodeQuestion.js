const mongoose = require('mongoose');

// AI Feedback Schema
const aiFeedbackSchema = new mongoose.Schema({
  timeComplexity: String,
  spaceComplexity: String,
  mistakes: [String],
  missingEdgeCases: [String],
  improvements: [String],
  bruteToOptimalSuggestions: [String],
  hint: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// LeetCode Question Schema
const leetCodeQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Problem Information
  title: {
    type: String,
    required: true
  },
  problemUrl: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  description: {
    type: String,
    required: true
  },
  
  // User Solution
  userCode: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript',
    enum: ['javascript', 'python', 'java', 'cpp', 'c']
  },
  
  // AI Feedback
  aiFeedback: aiFeedbackSchema,
  
  // User Notes
  userNotes: {
    type: String,
    default: ''
  },
  
  // Status
  status: {
    type: String,
    enum: ['Attempted', 'Solved Optimal', 'Needs Improvement'],
    default: 'Attempted'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
leetCodeQuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
leetCodeQuestionSchema.index({ user: 1, createdAt: -1 });
leetCodeQuestionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('LeetCodeQuestion', leetCodeQuestionSchema);
