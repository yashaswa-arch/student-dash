const mongoose = require('mongoose');

// Analytics Schema - Track user learning analytics and insights
const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Time period for this analytics record
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: [true, 'Analytics period is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Learning metrics
  learning: {
    totalStudyTime: { type: Number, default: 0 }, // minutes
    activeDays: { type: Number, default: 0 },
    averageSessionLength: { type: Number, default: 0 }, // minutes
    longestStreak: { type: Number, default: 0 }, // days
    currentStreak: { type: Number, default: 0 }, // days
    
    // Content consumption
    coursesStarted: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    videosWatched: { type: Number, default: 0 },
    totalVideoTime: { type: Number, default: 0 }, // minutes
    
    // Assessment performance
    quizzesTaken: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    improvementRate: { type: Number, default: 0 }, // percentage
    
    // Skills development
    newSkillsLearned: [String],
    skillLevelsImproved: [{
      skill: String,
      previousLevel: String,
      currentLevel: String
    }],
    
    // Learning velocity
    conceptsLearned: { type: Number, default: 0 },
    conceptsPerHour: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0 } // percentage
  },
  
  // Coding metrics
  coding: {
    totalSubmissions: { type: Number, default: 0 },
    successfulSubmissions: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }, // percentage
    averageExecutionTime: { type: Number, default: 0 }, // ms
    
    // Languages used
    languagesUsed: [{
      language: String,
      submissions: Number,
      successRate: Number
    }],
    
    // Problem difficulty
    easyProblems: { type: Number, default: 0 },
    mediumProblems: { type: Number, default: 0 },
    hardProblems: { type: Number, default: 0 },
    
    // Code quality metrics
    averageCodeQuality: { type: Number, default: 0 }, // 0-10
    averageComplexity: String, // Big O notation
    commonPatterns: [String],
    
    // Improvement areas
    commonErrors: [{
      errorType: String,
      frequency: Number
    }],
    suggestions: [String]
  },
  
  // Interview performance
  interview: {
    totalInterviews: { type: Number, default: 0 },
    mockInterviews: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 }, // 0-10
    averageCommunication: { type: Number, default: 0 }, // 0-10
    averageTechnical: { type: Number, default: 0 }, // 0-10
    
    // Areas of strength and improvement
    strengths: [String],
    improvementAreas: [String],
    
    // Progress tracking
    confidenceImprovement: { type: Number, default: 0 },
    technicalImprovement: { type: Number, default: 0 },
    communicationImprovement: { type: Number, default: 0 }
  },
  
  // Engagement metrics
  engagement: {
    totalSessions: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 }, // minutes
    bounceRate: { type: Number, default: 0 }, // percentage
    
    // Platform usage
    featuresUsed: [String],
    mostUsedFeature: String,
    deviceTypes: [String], // mobile, desktop, tablet
    
    // Social engagement
    forumPosts: { type: Number, default: 0 },
    helpedPeers: { type: Number, default: 0 },
    receivedHelp: { type: Number, default: 0 },
    
    // Satisfaction
    feedbackScore: { type: Number, default: 0 }, // 0-5
    npsScore: Number // Net Promoter Score
  },
  
  // Achievement metrics
  achievements: {
    totalEarned: { type: Number, default: 0 },
    newAchievements: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    currentRank: String,
    rankImprovement: Number,
    
    // Badge categories
    learningBadges: { type: Number, default: 0 },
    codingBadges: { type: Number, default: 0 },
    socialBadges: { type: Number, default: 0 },
    specialBadges: { type: Number, default: 0 }
  },
  
  // Predictive analytics
  predictions: {
    courseCompletionProbability: Number, // 0-1
    nextLikelyAction: String,
    riskOfDropout: Number, // 0-1
    recommendedStudyTime: Number, // minutes per day
    
    // Personalized insights
    learningStyle: String,
    optimalStudyTime: String, // time of day
    preferredContentType: String,
    strongSubjects: [String],
    challengingSubjects: [String]
  },
  
  // Goals and targets
  goals: {
    weeklyStudyTarget: Number, // minutes
    monthlyGoal: String,
    progressTowardGoals: Number, // percentage
    goalAchievements: [{
      goal: String,
      achievedAt: Date,
      targetDate: Date
    }]
  }
}, {
  timestamps: true
});

// Indexes for analytics
analyticsSchema.index({ user: 1, period: 1, startDate: -1 });
analyticsSchema.index({ user: 1, period: 1 }, { unique: true });
analyticsSchema.index({ startDate: 1, endDate: 1 });
analyticsSchema.index({ 'learning.currentStreak': -1 });
analyticsSchema.index({ 'coding.successRate': -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);