const mongoose = require('mongoose');

// Notification Schema - System notifications for users
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  type: {
    type: String,
    enum: [
      'achievement_unlocked',
      'course_deadline',
      'assignment_graded',
      'new_course_available',
      'interview_scheduled',
      'quiz_reminder',
      'streak_about_to_break',
      'course_completed',
      'payment_processed',
      'system_update',
      'peer_message',
      'instructor_feedback'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Related entities
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['course', 'lesson', 'quiz', 'achievement', 'interview', 'payment', 'user']
    },
    entityId: mongoose.Schema.Types.ObjectId
  },
  
  // Status and interaction
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Action button (optional)
  actionButton: {
    text: String,
    url: String,
    action: String // e.g., 'view_course', 'take_quiz', 'schedule_interview'
  },
  
  // Delivery channels
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  
  // Delivery status
  deliveryStatus: {
    inApp: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    email: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      opened: { type: Boolean, default: false },
      openedAt: Date
    },
    sms: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    push: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      clicked: { type: Boolean, default: false },
      clickedAt: Date
    }
  },
  
  // Scheduling
  scheduledFor: Date, // When to send the notification
  expiresAt: Date, // When the notification becomes irrelevant
  
  // Metadata
  category: {
    type: String,
    enum: ['academic', 'social', 'system', 'promotional', 'reminder'],
    default: 'academic'
  },
  source: {
    type: String,
    enum: ['system', 'instructor', 'peer', 'admin'],
    default: 'system'
  },
  
  // Rich content
  richContent: {
    imageUrl: String,
    iconUrl: String,
    videoUrl: String,
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number
    }]
  }
}, {
  timestamps: true
});

// Indexes for notifications
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ category: 1 });

module.exports = mongoose.model('Notification', notificationSchema);