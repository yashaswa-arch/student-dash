const mongoose = require('mongoose');

/**
 * Topic Schema - Top-level category for video lectures
 * Example: "Data Structures", "Algorithms", "Web Development"
 */
const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
topicSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

// Indexes
topicSchema.index({ slug: 1 });
topicSchema.index({ order: 1 });
topicSchema.index({ isActive: 1 });

module.exports = mongoose.model('Topic', topicSchema);

