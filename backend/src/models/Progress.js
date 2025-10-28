const mongoose = require('mongoose');

// User Progress Tracking Schema
const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'locked'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  startedAt: Date,
  
  // Detailed tracking for lessons/quizzes
  details: {
    // For video lessons
    watchedDuration: Number, // seconds watched
    totalDuration: Number, // total video length
    
    // For code lessons
    codeSubmissions: [{
      code: String,
      submittedAt: { type: Date, default: Date.now },
      passed: Boolean,
      testResults: [{
        testCase: String,
        passed: Boolean,
        actualOutput: String,
        expectedOutput: String
      }]
    }],
    
    // For quizzes
    answers: [{
      questionIndex: Number,
      answer: mongoose.Schema.Types.Mixed, // Can be string, array, etc.
      isCorrect: Boolean,
      pointsEarned: Number,
      timeSpent: Number // seconds
    }],
    
    // Reading progress for text lessons
    scrollPosition: Number,
    readingTime: Number
  },
  
  // Performance metrics
  metrics: {
    accuracy: Number, // percentage
    averageTimePerQuestion: Number, // for quizzes
    improvementRate: Number, // compared to previous attempts
    consistencyScore: Number // how consistent the performance is
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
progressSchema.index({ user: 1, course: 1 });
progressSchema.index({ user: 1, module: 1 });
progressSchema.index({ user: 1, lesson: 1 });
progressSchema.index({ user: 1, quiz: 1 });
progressSchema.index({ status: 1 });
progressSchema.index({ lastAccessed: 1 });

// Ensure unique progress per user per content item
progressSchema.index({ user: 1, course: 1, module: 1, lesson: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);