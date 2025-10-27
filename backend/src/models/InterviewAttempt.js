const mongoose = require('mongoose');

const interviewAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion',
    required: [true, 'Question is required']
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  durationSec: {
    type: Number,
    min: 0,
    default: null
  },
  transcript: {
    type: String,
    default: null
  },
  emotionMetrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
interviewAttemptSchema.index({ user: 1 });
interviewAttemptSchema.index({ question: 1 });
interviewAttemptSchema.index({ user: 1, question: 1 });
interviewAttemptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('InterviewAttempt', interviewAttemptSchema);

