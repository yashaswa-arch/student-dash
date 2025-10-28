const mongoose = require('mongoose');

// Learning Session Schema - Track individual study sessions
const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true
  },
  type: {
    type: String,
    enum: ['study', 'practice', 'interview', 'exam', 'review'],
    required: [true, 'Session type is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Content accessed during session
  activities: [{
    type: {
      type: String,
      enum: ['course_view', 'lesson_complete', 'quiz_attempt', 'code_submission', 'video_watch', 'reading', 'discussion']
    },
    contentId: mongoose.Schema.Types.ObjectId,
    contentType: {
      type: String,
      enum: ['course', 'module', 'lesson', 'quiz', 'coding_question']
    },
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    progress: Number, // 0-100%
    score: Number, // if applicable
    details: mongoose.Schema.Types.Mixed // Additional activity-specific data
  }],
  
  // Session performance metrics
  performance: {
    totalActivities: { type: Number, default: 0 },
    completedActivities: { type: Number, default: 0 },
    averageScore: Number,
    totalTimeSpent: Number, // minutes
    focusTime: Number, // minutes actually engaged
    breakTime: Number, // minutes on breaks
    distractionEvents: Number // times user left the platform
  },
  
  // Learning analytics
  analytics: {
    conceptsCovered: [String],
    skillsImproved: [String],
    difficultyProgression: {
      startLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      },
      endLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      }
    },
    learningVelocity: Number, // concepts per hour
    retentionRate: Number, // based on quiz performance
    engagementScore: Number // 0-100 based on interaction patterns
  },
  
  // Device and environment info
  deviceInfo: {
    platform: String, // web, mobile, desktop
    browser: String,
    screenResolution: String,
    timeZone: String
  },
  
  // Session feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    difficulty: {
      type: String,
      enum: ['too_easy', 'just_right', 'too_hard']
    },
    pace: {
      type: String,
      enum: ['too_slow', 'just_right', 'too_fast']
    },
    comments: String,
    improvements: [String]
  },
  
  // AI insights
  aiInsights: {
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading_writing']
    },
    recommendedNextSteps: [String],
    strengthAreas: [String],
    improvementAreas: [String],
    personalizedTips: [String]
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ user: 1, startTime: -1 });
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ type: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ startTime: 1, endTime: 1 });

// Virtual for session duration calculation
sessionSchema.virtual('calculatedDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // minutes
  }
  return 0;
});

module.exports = mongoose.model('Session', sessionSchema);