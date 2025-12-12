const mongoose = require('mongoose');

/**
 * Series Schema - Collection of videos under a topic
 * Example: "Binary Trees", "Dynamic Programming Basics"
 */
const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Series title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic reference is required']
  },
  thumbnail: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
seriesSchema.index({ topic: 1, order: 1 });
seriesSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Series', seriesSchema);

