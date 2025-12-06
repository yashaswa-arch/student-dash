const mongoose = require('mongoose');

const aptitudeAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  difficulty: {
    type: String,
    trim: true
  },
  questionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AptitudeQuestion'
  }],
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AptitudeQuestion',
      required: true
    },
    selectedIndex: {
      type: Number,
      default: -1
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeTakenSec: {
      type: Number,
      default: 0
    }
  }],
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions is required'],
    min: 0
  },
  correctCount: {
    type: Number,
    required: [true, 'Correct count is required'],
    min: 0
  },
  incorrectCount: {
    type: Number,
    required: [true, 'Incorrect count is required'],
    min: 0
  },
  skippedCount: {
    type: Number,
    required: [true, 'Skipped count is required'],
    min: 0
  },
  scorePercent: {
    type: Number,
    required: [true, 'Score percentage is required'],
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'aptitude_attempts'
});

// Indexes for faster queries
aptitudeAttemptSchema.index({ userId: 1, topic: 1 });
aptitudeAttemptSchema.index({ userId: 1, completedAt: -1 });
aptitudeAttemptSchema.index({ topic: 1 });

module.exports = mongoose.model('AptitudeAttempt', aptitudeAttemptSchema);
