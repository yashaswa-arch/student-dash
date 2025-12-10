const mongoose = require('mongoose');

const practiceSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'PracticeQuestion'
    },
    // Optional denormalized question metadata
    questionTitle: {
      type: String
    },
    topics: {
      type: [String],
      default: []
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard']
    },
    language: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    stdout: {
      type: String,
      default: ''
    },
    stderr: {
      type: String,
      default: ''
    },
    // New evaluation fields
    verdict: {
      type: String,
      enum: ['PENDING', 'PASSED', 'FAILED', 'COMPILE_ERROR', 'RUNTIME_ERROR'],
      default: 'PENDING'
    },
    passedTests: {
      type: Number,
      default: 0
    },
    totalTests: {
      type: Number,
      default: 0
    },
    // Legacy status field - kept for backward compatibility, but not used for logic
    status: {
      type: String,
      enum: ['success', 'error'],
      default: 'error' // Default to error for backward compatibility
    },
    // Optional metadata about where the submission came from
    source: {
      type: String,
      default: 'quick-practice'
    },
    timeTakenInMinutes: {
      type: Number
    }
  },
  {
    timestamps: true,
    collection: 'practice_submissions'
  }
);

practiceSubmissionSchema.index({
  userId: 1,
  questionId: 1,
  language: 1,
  createdAt: -1
});

const PracticeSubmission = mongoose.model(
  'PracticeSubmission',
  practiceSubmissionSchema
);

module.exports = PracticeSubmission;


