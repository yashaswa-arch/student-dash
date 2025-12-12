const mongoose = require('mongoose');

/**
 * PresenceSummary Schema - Tracks user engagement with video lectures
 * Uses finalized scoring formula for presence calculation
 */
const presenceSummarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Video reference is required']
  },
  // Total watch time in seconds
  totalWatchTime: {
    type: Number,
    default: 0,
    min: 0
  },
  // Percentage of video watched (0-100)
  watchPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Number of quizzes answered
  quizzesAnswered: {
    type: Number,
    default: 0,
    min: 0
  },
  // Number of quizzes answered correctly
  quizzesCorrect: {
    type: Number,
    default: 0,
    min: 0
  },
  // Presence score (0-100) calculated using finalized formula
  // Formula: (watchPercentage * 0.5) + (quizAccuracy * 0.5)
  // where quizAccuracy = (quizzesCorrect / quizzesAnswered) * 100 (if quizzesAnswered > 0, else 0)
  presenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Last updated timestamp
  lastWatchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index to ensure one summary per user-video pair
presenceSummarySchema.index({ user: 1, video: 1 }, { unique: true });
presenceSummarySchema.index({ user: 1, presenceScore: -1 });
presenceSummarySchema.index({ video: 1, presenceScore: -1 });

/**
 * Calculate and update presence score
 * Formula: (watchPercentage * 0.5) + (quizAccuracy * 0.5)
 */
presenceSummarySchema.methods.calculatePresenceScore = function() {
  const watchWeight = 0.5;
  const quizWeight = 0.5;
  
  // Calculate quiz accuracy (0-100)
  let quizAccuracy = 0;
  if (this.quizzesAnswered > 0) {
    quizAccuracy = (this.quizzesCorrect / this.quizzesAnswered) * 100;
  }
  
  // Calculate presence score
  this.presenceScore = Math.round(
    (this.watchPercentage * watchWeight) + (quizAccuracy * quizWeight)
  );
  
  return this.presenceScore;
};

module.exports = mongoose.model('PresenceSummary', presenceSummarySchema);

