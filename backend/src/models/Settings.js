const mongoose = require('mongoose');

// System Settings Schema - Global platform configuration
const settingsSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['general', 'email', 'payment', 'ai', 'security', 'performance', 'feature_flags'],
    required: [true, 'Settings category is required']
  },
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Setting value is required']
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: [true, 'Data type is required']
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false // Whether this setting can be accessed by clients
  },
  isEditable: {
    type: Boolean,
    default: true // Whether this setting can be modified
  },
  validationRules: {
    min: Number,
    max: Number,
    allowedValues: [mongoose.Schema.Types.Mixed],
    pattern: String, // Regex pattern for validation
    required: Boolean
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// User Preferences Schema - Individual user settings
const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  
  // General preferences
  general: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'hi']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    },
    timeFormat: {
      type: String,
      default: '12h',
      enum: ['12h', '24h']
    }
  },
  
  // Learning preferences
  learning: {
    defaultProgrammingLanguage: {
      type: String,
      default: 'javascript',
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'swift']
    },
    difficulty: {
      type: String,
      default: 'beginner',
      enum: ['beginner', 'intermediate', 'advanced', 'adaptive']
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading_writing'],
      default: 'visual'
    },
    studyReminders: {
      type: Boolean,
      default: true
    },
    dailyStudyGoal: {
      type: Number,
      default: 30, // minutes
      min: 15,
      max: 480
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    showHints: {
      type: Boolean,
      default: true
    },
    showSolutions: {
      type: Boolean,
      default: true
    }
  },
  
  // Notification preferences
  notifications: {
    email: {
      achievements: { type: Boolean, default: true },
      courseUpdates: { type: Boolean, default: true },
      deadlines: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false }
    },
    push: {
      achievements: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      liveEvents: { type: Boolean, default: true },
      forum: { type: Boolean, default: false }
    },
    inApp: {
      achievements: { type: Boolean, default: true },
      courseProgress: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
      system: { type: Boolean, default: true }
    }
  },
  
  // Privacy preferences
  privacy: {
    profileVisibility: {
      type: String,
      default: 'public',
      enum: ['public', 'friends', 'private']
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    showAchievements: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    }
  },
  
  // Accessibility preferences
  accessibility: {
    fontSize: {
      type: String,
      default: 'medium',
      enum: ['small', 'medium', 'large', 'extra_large']
    },
    contrast: {
      type: String,
      default: 'normal',
      enum: ['normal', 'high']
    },
    reducedMotion: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    },
    keyboardNavigation: {
      type: Boolean,
      default: false
    }
  },
  
  // Interface preferences
  interface: {
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    codeEditorTheme: {
      type: String,
      default: 'vscode',
      enum: ['vscode', 'sublime', 'atom', 'monokai', 'github']
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    showLineNumbers: {
      type: Boolean,
      default: true
    },
    fontSize: {
      type: Number,
      default: 14,
      min: 10,
      max: 24
    },
    tabSize: {
      type: Number,
      default: 4,
      min: 2,
      max: 8
    }
  },
  
  // Advanced preferences
  advanced: {
    enableBetaFeatures: {
      type: Boolean,
      default: false
    },
    enableAnalytics: {
      type: Boolean,
      default: true
    },
    enableAI: {
      type: Boolean,
      default: true
    },
    codeCompletion: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes
settingsSchema.index({ category: 1, key: 1 }, { unique: true });
settingsSchema.index({ isPublic: 1 });
settingsSchema.index({ lastModifiedBy: 1 });

userPreferencesSchema.index({ user: 1 });

const Settings = mongoose.model('Settings', settingsSchema);
const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = { Settings, UserPreferences };