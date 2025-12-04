const mongoose = require('mongoose');

const starterCodeSchema = new mongoose.Schema({
  java: { type: String, default: '' },
  cpp: { type: String, default: '' },
  python: { type: String, default: '' },
  javascript: { type: String, default: '' }
}, { _id: false });

const practiceQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sampleInput: {
    type: String,
    required: true
  },
  sampleOutput: {
    type: String,
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true,
    index: true
  },
  starterCode: {
    type: starterCodeSchema,
    required: true
  }
}, {
  timestamps: true,
  collection: 'practice_questions'
});

practiceQuestionSchema.index({ topic: 1 });
practiceQuestionSchema.index({ difficulty: 1 });

const PracticeQuestion = mongoose.model('PracticeQuestion', practiceQuestionSchema);

module.exports = PracticeQuestion;


