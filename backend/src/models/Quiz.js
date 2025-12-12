const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  videoId: { type: String, required: true },           // video.videoId (YouTube id) or Mongo _id — app uses videoId param consistently
  timestamp: { type: Number, required: true },         // seconds into video where quiz should fire
  question: { type: String, required: true },
  options: { type: [String], default: [] },
  correctIndex: { type: Number, default: null },       // optional; Gemini may return answer index
  meta: { type: mongoose.Schema.Types.Mixed },         // store generation metadata
  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
QuizSchema.index({ videoId: 1, timestamp: 1 });
QuizSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Quiz', QuizSchema);
