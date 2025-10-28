const mongoose = require('mongoose');

// Quiz Schema - Interactive assessments
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  questions: [{
    question: {
      type: String,
      required: [true, 'Question text is required']
    },
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'code', 'essay'],
      required: [true, 'Question type is required']
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // For short answer/essay questions
    codeTemplate: String, // For coding questions
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: { type: Boolean, default: false }
    }],
    points: {
      type: Number,
      default: 1,
      min: 0
    },
    explanation: String, // Explanation shown after answering
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  availableFrom: Date,
  availableUntil: Date,
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, q) => total + q.points, 0);
});

// Indexes
quizSchema.index({ course: 1 });
quizSchema.index({ module: 1 });
quizSchema.index({ lesson: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ availableFrom: 1, availableUntil: 1 });

module.exports = mongoose.model('Quiz', quizSchema);