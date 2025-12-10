const mongoose = require('mongoose');

const codingProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['codeforces', 'leetcode', 'hackerrank'],
      trim: true,
      lowercase: true
    },
    handle: {
      type: String,
      required: [true, 'Handle is required'],
      trim: true
    },
    profileUrl: {
      type: String,
      trim: true,
      default: null
    },
    displayName: {
      type: String,
      trim: true,
      default: null
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: null
    },
    stats: {
      totalSolved: {
        type: Number,
        default: 0
      },
      easySolved: {
        type: Number,
        default: 0
      },
      mediumSolved: {
        type: Number,
        default: 0
      },
      hardSolved: {
        type: Number,
        default: 0
      },
      rating: {
        type: Number,
        default: null
      },
      maxRating: {
        type: Number,
        default: null
      },
      badges: [{
        name: {
          type: String,
          required: true
        },
        level: {
          type: String,
          required: true
        }
      }],
      lastContest: {
        type: String,
        default: null
      },
      // Legacy fields for backward compatibility
      contestsPlayed: {
        type: Number,
        default: 0
      },
      rank: {
        type: String,
        default: null
      },
      raw: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      }
    },
    lastSyncedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'coding_profiles'
  }
);

// Pre-save hook to normalize platform to lowercase (for backward compatibility)
codingProfileSchema.pre('save', function(next) {
  if (this.platform) {
    const normalized = this.platform.toLowerCase().trim();
    // Handle legacy uppercase values and aliases
    if (normalized === 'codeforces' || normalized === 'cf') {
      this.platform = 'codeforces';
    } else if (normalized === 'leetcode' || normalized === 'lc') {
      this.platform = 'leetcode';
    } else if (normalized === 'hackerrank' || normalized === 'hr') {
      this.platform = 'hackerrank';
    } else {
      this.platform = normalized;
    }
  }
  next();
});

// Unique compound index on { user, platform }
codingProfileSchema.index({ user: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('CodingProfile', codingProfileSchema);


