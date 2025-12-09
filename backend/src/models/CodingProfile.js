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
      enum: ['HACKERRANK', 'CODEFORCES'],
      trim: true
    },
    handle: {
      type: String,
      required: [true, 'Handle is required'],
      trim: true
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

// Unique compound index on { user, platform }
codingProfileSchema.index({ user: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('CodingProfile', codingProfileSchema);


