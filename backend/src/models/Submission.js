const mongoose = require('mongoose');

// Code Submission Schema - For tracking all code submissions
const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  codingQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  code: {
    type: String,
    required: [true, 'Code content is required']
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'swift'],
    required: [true, 'Programming language is required']
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
    default: 'pending'
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  memoryUsage: {
    type: Number, // in KB
    default: 0
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  testResults: [{
    testCase: {
      input: String,
      expectedOutput: String
    },
    actualOutput: String,
    passed: {
      type: Boolean,
      default: false
    },
    executionTime: Number,
    errorMessage: String
  }],
  compilationOutput: String,
  runtimeOutput: String,
  errorMessage: String,
  
  // AI Analysis
  aiAnalysis: {
    codeQuality: {
      score: { type: Number, min: 0, max: 10 },
      readability: { type: Number, min: 0, max: 10 },
      efficiency: { type: Number, min: 0, max: 10 },
      maintainability: { type: Number, min: 0, max: 10 }
    },
    suggestions: [{
      type: {
        type: String,
        enum: ['optimization', 'bug_fix', 'style', 'best_practice', 'security']
      },
      message: String,
      lineNumber: Number,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    complexity: {
      timeComplexity: String, // e.g., "O(n)", "O(log n)"
      spaceComplexity: String,
      cyclomaticComplexity: Number
    },
    patterns: [{
      name: String, // e.g., "Factory Pattern", "Singleton"
      confidence: Number // 0-1
    }]
  },
  
  // Plagiarism detection
  plagiarismCheck: {
    similarity: Number, // 0-100%
    suspiciousMatches: [{
      source: String,
      similarity: Number,
      matchedLines: [Number]
    }],
    checkedAt: Date
  },
  
  // Performance metrics
  metrics: {
    linesOfCode: Number,
    charactersTyped: Number,
    timeToComplete: Number, // minutes from start to submission
    syntaxErrors: Number,
    logicalErrors: Number
  }
}, {
  timestamps: true
});

// Indexes for performance
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ codingQuestion: 1 });
submissionSchema.index({ lesson: 1 });
submissionSchema.index({ quiz: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ language: 1 });
submissionSchema.index({ score: -1 });

module.exports = mongoose.model('Submission', submissionSchema);