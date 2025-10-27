const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  }
}, { _id: false });

const codingQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true
  },
  statement: {
    type: String,
    required: [true, 'Question statement is required']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty level is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  testCases: [testCaseSchema]
}, {
  timestamps: true
});

// Index for faster queries
codingQuestionSchema.index({ difficulty: 1 });
codingQuestionSchema.index({ tags: 1 });
codingQuestionSchema.index({ title: 'text', statement: 'text' });

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);

