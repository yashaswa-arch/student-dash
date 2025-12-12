const mongoose = require('mongoose');

/**
 * VideoQuiz Schema - Quiz associated with a video segment
 * correctIndex is stored server-side and NOT sent to client
 */
const videoQuizSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Video reference is required']
  },
  // Timestamp in seconds where this quiz appears
  timestamp: {
    type: Number,
    required: [true, 'Quiz timestamp is required'],
    min: 0
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  // Multiple choice options
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  // Index of correct answer (0-based, stored server-side only)
  correctIndex: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: 0,
    validate: {
      validator: function(value) {
        return value < this.options.length;
      },
      message: 'Correct index must be within options array bounds'
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // Confidence score from AI generation (0-1)
  confidence: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1
  },
  // Publication status
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
videoQuizSchema.index({ video: 1, timestamp: 1 });
videoQuizSchema.index({ isPublished: 1 });

// Virtual to get correct answer text (for server-side use only)
videoQuizSchema.virtual('correctAnswer').get(function() {
  return this.options[this.correctIndex];
});

module.exports = mongoose.model('VideoQuiz', videoQuizSchema);

