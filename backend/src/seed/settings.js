const { Settings, UserPreferences } = require('../models');

// Default system settings
const systemSettings = [
  // General settings
  {
    category: 'general',
    key: 'platform_name',
    value: 'SAP — Skill Analytics Platform',
    dataType: 'string',
    description: 'The name of the learning platform',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'general',
    key: 'max_file_upload_size',
    value: 10485760, // 10MB
    dataType: 'number',
    description: 'Maximum file upload size in bytes',
    isPublic: true,
    isEditable: true,
    validationRules: {
      min: 1048576, // 1MB
      max: 104857600 // 100MB
    }
  },
  {
    category: 'general',
    key: 'supported_languages',
    value: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'swift'],
    dataType: 'array',
    description: 'List of supported programming languages',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'general',
    key: 'maintenance_mode',
    value: false,
    dataType: 'boolean',
    description: 'Enable maintenance mode',
    isPublic: true,
    isEditable: true
  },
  
  // Email settings
  {
    category: 'email',
    key: 'smtp_host',
    value: 'smtp.gmail.com',
    dataType: 'string',
    description: 'SMTP server host',
    isPublic: false,
    isEditable: true
  },
  {
    category: 'email',
    key: 'smtp_port',
    value: 587,
    dataType: 'number',
    description: 'SMTP server port',
    isPublic: false,
    isEditable: true
  },
  {
    category: 'email',
    key: 'from_email',
    value: 'noreply@sap.com',
    dataType: 'string',
    description: 'Default from email address',
    isPublic: false,
    isEditable: true
  },
  
  // Payment settings
  {
    category: 'payment',
    key: 'stripe_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable Stripe payments',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'payment',
    key: 'paypal_enabled',
    value: false,
    dataType: 'boolean',
    description: 'Enable PayPal payments',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'payment',
    key: 'default_currency',
    value: 'USD',
    dataType: 'string',
    description: 'Default currency for payments',
    isPublic: true,
    isEditable: true,
    validationRules: {
      allowedValues: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    }
  },
  
  // AI settings
  {
    category: 'ai',
    key: 'openai_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable OpenAI integration',
    isPublic: false,
    isEditable: true
  },
  {
    category: 'ai',
    key: 'code_analysis_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable AI code analysis',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'ai',
    key: 'interview_ai_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable AI-powered interview feedback',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'ai',
    key: 'max_ai_requests_per_hour',
    value: 100,
    dataType: 'number',
    description: 'Maximum AI requests per user per hour',
    isPublic: false,
    isEditable: true,
    validationRules: {
      min: 10,
      max: 1000
    }
  },
  
  // Security settings
  {
    category: 'security',
    key: 'session_timeout',
    value: 3600, // 1 hour
    dataType: 'number',
    description: 'Session timeout in seconds',
    isPublic: false,
    isEditable: true,
    validationRules: {
      min: 300, // 5 minutes
      max: 86400 // 24 hours
    }
  },
  {
    category: 'security',
    key: 'max_login_attempts',
    value: 5,
    dataType: 'number',
    description: 'Maximum login attempts before lockout',
    isPublic: false,
    isEditable: true,
    validationRules: {
      min: 3,
      max: 10
    }
  },
  {
    category: 'security',
    key: 'password_min_length',
    value: 8,
    dataType: 'number',
    description: 'Minimum password length',
    isPublic: true,
    isEditable: true,
    validationRules: {
      min: 6,
      max: 20
    }
  },
  
  // Performance settings
  {
    category: 'performance',
    key: 'cache_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable caching',
    isPublic: false,
    isEditable: true
  },
  {
    category: 'performance',
    key: 'cache_ttl',
    value: 3600, // 1 hour
    dataType: 'number',
    description: 'Cache time-to-live in seconds',
    isPublic: false,
    isEditable: true
  },
  {
    category: 'performance',
    key: 'rate_limit_requests',
    value: 1000,
    dataType: 'number',
    description: 'Rate limit requests per hour',
    isPublic: false,
    isEditable: true
  },
  
  // Feature flags
  {
    category: 'feature_flags',
    key: 'beta_features_enabled',
    value: false,
    dataType: 'boolean',
    description: 'Enable beta features',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'feature_flags',
    key: 'forum_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable discussion forum',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'feature_flags',
    key: 'live_interviews_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable live interview sessions',
    isPublic: true,
    isEditable: true
  },
  {
    category: 'feature_flags',
    key: 'achievements_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable achievement system',
    isPublic: true,
    isEditable: true
  }
];

// Sample user preferences (this would be created when users register)
const sampleUserPreferences = {
  general: {
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  },
  learning: {
    defaultProgrammingLanguage: 'javascript',
    difficulty: 'beginner',
    learningStyle: 'visual',
    studyReminders: true,
    dailyStudyGoal: 60,
    autoplay: true,
    showHints: true,
    showSolutions: true
  },
  notifications: {
    email: {
      achievements: true,
      courseUpdates: true,
      deadlines: true,
      newsletter: false,
      marketing: false
    },
    push: {
      achievements: true,
      reminders: true,
      liveEvents: true,
      forum: false
    },
    inApp: {
      achievements: true,
      courseProgress: true,
      social: true,
      system: true
    }
  },
  privacy: {
    profileVisibility: 'public',
    showProgress: true,
    showAchievements: true,
    allowMessages: true,
    showOnlineStatus: true
  },
  accessibility: {
    fontSize: 'medium',
    contrast: 'normal',
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false
  },
  interface: {
    theme: 'light',
    codeEditorTheme: 'vscode',
    sidebarCollapsed: false,
    showLineNumbers: true,
    fontSize: 14,
    tabSize: 4
  },
  advanced: {
    enableBetaFeatures: false,
    enableAnalytics: true,
    enableAI: true,
    codeCompletion: true,
    autoSave: true
  }
};

module.exports = {
  systemSettings,
  sampleUserPreferences
};