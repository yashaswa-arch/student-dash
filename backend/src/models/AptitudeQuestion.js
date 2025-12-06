const mongoose = require('mongoose');

const aptitudeQuestionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  subtopic: {
    type: String,
    trim: true
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'At least 2 options are required'
    }
  },
  correctIndex: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  source: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'aptitude_questions'
});

// Indexes for faster queries
aptitudeQuestionSchema.index({ topic: 1, difficulty: 1 });
aptitudeQuestionSchema.index({ topic: 1 });
aptitudeQuestionSchema.index({ isActive: 1 });

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
