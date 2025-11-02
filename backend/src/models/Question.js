const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: ''
  },
  expectedOutput: {
    type: String,
    default: ''
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  actualOutput: {
    type: String,
    default: ''
  }
});

const submissionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['java', 'python', 'javascript', 'cpp', 'c', 'csharp', 'go', 'rust', 'typescript']
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'runtime_error', 'time_limit_exceeded'],
    default: 'failed'
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  aiAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    timeComplexity: String,
    spaceComplexity: String,
    securityIssues: [{
      type: {
        type: String
      },
      severity: String,
      description: String,
      line: Number
    }],
    performanceIssues: [{
      type: {
        type: String
      },
      description: String,
      suggestion: String
    }],
    codeSmells: [{
      type: {
        type: String
      },
      description: String,
      suggestion: String
    }],
    suggestions: [String],
    betterApproach: String,
    explanation: String
  },
  executionTime: Number,
  memoryUsed: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'hackerrank', 'codechef', 'custom', 'other'],
    default: 'custom'
  },
  platformUrl: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'attempted', 'solved'],
    default: 'todo'
  },
  tags: [{
    type: String,
    trim: true
  }],
  topics: [{
    type: String,
    enum: [
      'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
      'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
      'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Bit Manipulation',
      'Stack', 'Design', 'Heap (Priority Queue)', 'Graph', 'Simulation',
      'Prefix Sum', 'Counting', 'Sliding Window', 'Union Find', 'Linked List'
    ]
  }],
  testCases: [testCaseSchema],
  submissions: [submissionSchema],
  notes: {
    type: String,
    default: ''
  },
  hints: [String],
  constraints: String,
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptedAt: Date,
  solvedAt: Date,
  isFavorite: {
    type: Boolean,
    default: false
  },
  reviewDate: Date, // for spaced repetition
  masteryLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
questionSchema.index({ user: 1, status: 1 });
questionSchema.index({ user: 1, difficulty: 1 });
questionSchema.index({ user: 1, platform: 1 });
questionSchema.index({ user: 1, topics: 1 });
questionSchema.index({ title: 'text', description: 'text' });

// Virtual for best submission
questionSchema.virtual('bestSubmission').get(function() {
  if (this.submissions.length === 0) return null;
  return this.submissions.reduce((best, current) => {
    if (!best) return current;
    if (current.status === 'passed' && best.status !== 'passed') return current;
    if (current.testCasesPassed > best.testCasesPassed) return current;
    if (current.aiAnalysis?.score > (best.aiAnalysis?.score || 0)) return current;
    return best;
  });
});

// Method to update status based on submissions
questionSchema.methods.updateStatus = function() {
  if (this.submissions.length === 0) {
    this.status = 'todo';
  } else {
    const hasPassedSubmission = this.submissions.some(s => s.status === 'passed');
    if (hasPassedSubmission) {
      this.status = 'solved';
      if (!this.solvedAt) {
        this.solvedAt = new Date();
      }
    } else {
      this.status = 'attempted';
      this.lastAttemptedAt = new Date();
    }
  }
  this.attempts = this.submissions.length;
};

// Static method to get user stats
questionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        solved: {
          $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
        },
        attempted: {
          $sum: { $cond: [{ $eq: ['$status', 'attempted'] }, 1, 0] }
        },
        todo: {
          $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
        },
        easy: {
          $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] }
        },
        medium: {
          $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] }
        },
        hard: {
          $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] }
        },
        easySolved: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$status', 'solved'] },
                { $eq: ['$difficulty', 'easy'] }
              ]},
              1,
              0
            ]
          }
        },
        mediumSolved: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$status', 'solved'] },
                { $eq: ['$difficulty', 'medium'] }
              ]},
              1,
              0
            ]
          }
        },
        hardSolved: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$status', 'solved'] },
                { $eq: ['$difficulty', 'hard'] }
              ]},
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    solved: 0,
    attempted: 0,
    todo: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  };
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
