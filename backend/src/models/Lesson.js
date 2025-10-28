const mongoose = require('mongoose');

// Individual Lesson Schema - Content units within modules
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module reference is required']
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: 1
  },
  type: {
    type: String,
    enum: ['video', 'text', 'code', 'quiz', 'assignment', 'live_session'],
    required: [true, 'Lesson type is required']
  },
  content: {
    // For text/video lessons
    text: String,
    videoUrl: String,
    videoLength: Number, // in seconds
    
    // For code lessons
    codeTemplate: String,
    expectedOutput: String,
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: { type: Boolean, default: false }
    }],
    
    // For assignments
    instructions: String,
    maxAttempts: { type: Number, default: 3 },
    timeLimit: Number, // in minutes
    
    // For live sessions
    scheduledTime: Date,
    meetingLink: String,
    recordingUrl: String
  },
  language: {
    // Programming language for code lessons
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'swift']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  points: {
    type: Number,
    default: 10,
    min: 0
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ type: 1 });
lessonSchema.index({ difficulty: 1 });
lessonSchema.index({ language: 1 });
lessonSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);