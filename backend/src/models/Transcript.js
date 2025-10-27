const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  attempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewAttempt',
    required: [true, 'Interview attempt is required']
  },
  audioUrl: {
    type: String,
    default: null
  },
  transcriptText: {
    type: String,
    default: null
  },
  durationSec: {
    type: Number,
    min: 0,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
transcriptSchema.index({ user: 1 });
transcriptSchema.index({ attempt: 1 });
transcriptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transcript', transcriptSchema);

