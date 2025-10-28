const mongoose = require('mongoose');

// Course Module Schema - Organized sections within courses
const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  order: {
    type: Number,
    required: [true, 'Module order is required'],
    min: 1
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  learningObjectives: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document', 'code']
    },
    url: String,
    size: Number // in bytes
  }]
}, {
  timestamps: true
});

// Indexes for better performance
moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ course: 1, isPublished: 1 });
moduleSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Module', moduleSchema);