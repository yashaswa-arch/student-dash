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
    status: {
      type: String,
      enum: ['success', 'error'],
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'practice_submissions'
  }
);

practiceSubmissionSchema.index({ userId: 1, questionId: 1, language: 1, createdAt: -1 });

const PracticeSubmission = mongoose.model('PracticeSubmission', practiceSubmissionSchema);

module.exports = PracticeSubmission;


