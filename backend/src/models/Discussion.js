const mongoose = require('mongoose');

// Discussion Forum Schema - Community discussions and Q&A
const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true,
    maxLength: 200
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author reference is required']
  },
  category: {
    type: String,
    enum: ['general', 'coding_help', 'course_question', 'career_advice', 'project_showcase', 'bug_report', 'feature_request'],
    required: [true, 'Discussion category is required']
  },
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement'],
    default: 'discussion'
  },
  
  // Related content
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  relatedCodingQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion'
  },
  
  // Tags and topics
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  programmingLanguage: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'swift', 'other']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  
  // Interaction metrics
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookmarkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and moderation
  status: {
    type: String,
    enum: ['active', 'closed', 'deleted', 'pending_approval'],
    default: 'active'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  
  // Best answer (for questions)
  bestAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionReply'
  },
  
  // Rich content
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String
  }],
  codeSnippets: [{
    language: String,
    code: String,
    description: String
  }],
  
  // Moderation
  moderationFlags: [{
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Analytics
  analytics: {
    uniqueViewers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    avgTimeSpent: Number, // seconds
    bounceRate: Number,
    engagementScore: Number
  }
}, {
  timestamps: true
});

// Discussion Reply Schema
const discussionReplySchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: [true, 'Discussion reference is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author reference is required']
  },
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true
  },
  
  // Threading support
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionReply'
  },
  depth: {
    type: Number,
    default: 0,
    max: 5 // Limit nesting depth
  },
  
  // Interaction metrics
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'deleted', 'pending_approval'],
    default: 'active'
  },
  isAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  
  // Rich content
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String
  }],
  codeSnippets: [{
    language: String,
    code: String,
    description: String
  }],
  
  // Moderation
  moderationFlags: [{
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Edit history
  editHistory: [{
    editedAt: Date,
    previousContent: String,
    editReason: String
  }]
}, {
  timestamps: true
});

// Indexes for discussions
discussionSchema.index({ author: 1, createdAt: -1 });
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ relatedCourse: 1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ status: 1, isPinned: -1, createdAt: -1 });
discussionSchema.index({ programmingLanguage: 1 });
discussionSchema.index({ 'likes.user': 1 });

// Indexes for replies
discussionReplySchema.index({ discussion: 1, createdAt: 1 });
discussionReplySchema.index({ author: 1, createdAt: -1 });
discussionReplySchema.index({ parentReply: 1 });
discussionReplySchema.index({ isAcceptedAnswer: 1 });

// Virtual for reply count
discussionSchema.virtual('replyCount', {
  ref: 'DiscussionReply',
  localField: '_id',
  foreignField: 'discussion',
  count: true
});

// Virtual for like count
discussionSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

discussionReplySchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

const Discussion = mongoose.model('Discussion', discussionSchema);
const DiscussionReply = mongoose.model('DiscussionReply', discussionReplySchema);

module.exports = { Discussion, DiscussionReply };