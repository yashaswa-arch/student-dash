const mongoose = require('mongoose');

/**
 * Video Schema - Individual video lecture
 * Must include: durationSeconds, segmentTimestamps, src, provider, thumbnail
 */
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: [true, 'Series reference is required']
  },
  // Video source URL (YouTube, Vimeo, etc.)
  src: {
    type: String,
    required: [true, 'Video source URL is required'],
    trim: true
  },
  // Provider: 'youtube', 'vimeo', 'custom', etc.
  provider: {
    type: String,
    required: [true, 'Video provider is required'],
    enum: ['youtube', 'vimeo', 'custom'],
    default: 'youtube'
  },
  // Video ID from provider (e.g., YouTube video ID)
  videoId: {
    type: String,
    trim: true
  },
  // Thumbnail image URL
  thumbnail: {
    type: String,
    trim: true
  },
  // Duration in seconds (required for auto-timestamps)
  durationSeconds: {
    type: Number,
    default: null,
    min: 0
  },
  // Segment timestamps for quiz placement (in seconds)
  // Format: [60, 120, 300, 600] means quizzes at 1min, 2min, 5min, 10min
  segmentTimestamps: [{
    type: Number,
    min: 0
  }],
  // Order within series
  order: {
    type: Number,
    default: 0
  },
  // Publication status
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
videoSchema.index({ series: 1, order: 1 });
videoSchema.index({ isPublished: 1 });
videoSchema.index({ provider: 1, videoId: 1 });

module.exports = mongoose.model('Video', videoSchema);

