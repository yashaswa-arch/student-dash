const mongoose = require('mongoose');

// Achievement/Badge System Schema
const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true
  },
  icon: {
    type: String, // URL to icon image
    required: [true, 'Achievement icon is required']
  },
  type: {
    type: String,
    enum: ['course_completion', 'streak', 'score', 'time_based', 'skill_mastery', 'participation', 'special'],
    required: [true, 'Achievement type is required']
  },
  category: {
    type: String,
    enum: ['learning', 'coding', 'interview', 'collaboration', 'milestone'],
    required: [true, 'Achievement category is required']
  },
  difficulty: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  points: {
    type: Number,
    required: [true, 'Achievement points are required'],
    min: 0
  },
  
  // Unlock criteria
  criteria: {
    // Course-related criteria
    coursesCompleted: Number,
    specificCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    
    // Score-related criteria
    minimumScore: Number,
    averageScore: Number,
    perfectScores: Number,
    
    // Time-related criteria
    studyStreak: Number, // consecutive days
    totalStudyTime: Number, // total minutes
    dailyStudyTime: Number, // minutes per day
    
    // Skill-related criteria
    languagesMastered: [String],
    topicsCompleted: [String],
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    
    // Social/participation criteria
    helpedPeers: Number,
    forumPosts: Number,
    sessionAttendance: Number,
    
    // Special criteria
    customCriteria: mongoose.Schema.Types.Mixed
  },
  
  // Badge appearance
  design: {
    color: String,
    backgroundColor: String,
    borderColor: String,
    animation: String, // CSS animation class
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    }
  },
  
  // Unlock information
  unlockMessage: String,
  celebrationMessage: String,
  shareableText: String,
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false // Hidden achievements for special events
  },
  prerequisiteAchievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  
  // Statistics
  stats: {
    totalUnlocked: { type: Number, default: 0 },
    unlockRate: Number, // percentage of users who unlocked this
    averageTimeToUnlock: Number // average days to unlock
  }
}, {
  timestamps: true
});

// User Achievement Schema - Tracks which users have which achievements
const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: [true, 'Achievement reference is required']
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 100, // 100% when unlocked
    min: 0,
    max: 100
  },
  
  // Context when unlocked
  unlockContext: {
    triggerActivity: String, // what activity triggered the unlock
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }
  },
  
  // Display preferences
  isDisplayed: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isShared: {
    type: Boolean,
    default: false
  },
  
  // Celebration status
  celebrationShown: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for achievements
achievementSchema.index({ type: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ difficulty: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ 'design.rarity': 1 });

// Indexes for user achievements
userAchievementSchema.index({ user: 1, unlockedAt: -1 });
userAchievementSchema.index({ achievement: 1 });
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ isPinned: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = { Achievement, UserAchievement };