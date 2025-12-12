const mongoose = require('mongoose');

/**
 * QuizAttempt Schema - Records user's attempt at a video quiz
 */
const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoQuiz',
    required: [true, 'Quiz reference is required']
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Video reference is required']
  },
  // User's selected answer index (0-based)
  selectedIndex: {
    type: Number,
    required: [true, 'Selected answer index is required'],
    min: 0
  },
  // Whether the answer was correct
  isCorrect: {
    type: Boolean,
    required: true
  },
  // Timestamp when quiz was answered (video playback time)
  videoTimestamp: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, video: 1 });
quizAttemptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

