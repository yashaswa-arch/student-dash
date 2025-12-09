const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Contest name is required'],
      trim: true
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
      index: true
    },
    url: {
      type: String,
      required: [true, 'Contest URL is required'],
      trim: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 0
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'contests'
  }
);

// Compound indexes for common queries
contestSchema.index({ platform: 1, startTime: 1 });
contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ startTime: 1, platform: 1 });

module.exports = mongoose.model('Contest', contestSchema);

