// Main models export file
const User = require('./User');
const Course = require('./Course');
const CodingQuestion = require('./CodingQuestion');
const InterviewAttempt = require('./InterviewAttempt');
const Transcript = require('./Transcript');
const Question = require('./Question');

// New comprehensive models
const Module = require('./Module');
const Lesson = require('./Lesson');
const Quiz = require('./Quiz');
const Progress = require('./Progress');
const Submission = require('./Submission');
const Session = require('./Session');
const { Achievement, UserAchievement } = require('./Achievement');
const Notification = require('./Notification');
const Payment = require('./Payment');
const Analytics = require('./Analytics');
const { Discussion, DiscussionReply } = require('./Discussion');
const { Settings, UserPreferences } = require('./Settings');

module.exports = {
  // Core models
  User,
  Course,
  CodingQuestion,
  InterviewAttempt,
  Transcript,
  Question, // NEW: Question Tracker
  
  // Learning structure models
  Module,
  Lesson,
  Quiz,
  Progress,
  
  // Interaction models
  Submission,
  Session,
  
  // Gamification models
  Achievement,
  UserAchievement,
  
  // Communication models
  Notification,
  Discussion,
  DiscussionReply,
  
  // Business models
  Payment,
  
  // Analytics models
  Analytics,
  
  // Configuration models
  Settings,
  UserPreferences
};