const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const websocketService = require('./services/websocketService');

// Import routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const codingQuestionRoutes = require('./routes/codingQuestionRoutes');
const interviewAttemptRoutes = require('./routes/interviewAttemptRoutes');
const transcriptRoutes = require('./routes/transcriptRoutes');
const authRoutes = require('./routes/authRoutes');
const codeExecutionRoutes = require('./routes/codeExecutionRoutes');
const executeRoutes = require('./routes/executeRoutes');
const practiceQuestionRoutes = require('./routes/practiceQuestionRoutes');
const practiceSubmissionRoutes = require('./routes/practiceSubmissionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const questionRoutes = require('./routes/questionRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoutes');
const aptitudeRoutes = require('./routes/aptitudeRoutes');
const codingProfileRoutes = require('./routes/codingProfileRoutes');
const githubRoutes = require('./routes/githubRoutes');
const contestRoutes = require('./routes/contestRoutes');
const videoLectureRoutes = require('./routes/videoLectureRoutes');
const devAuthRoutes = require('./routes/devAuth');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));

// CORS - Allow specific origins for development
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.29.214:3000',
    /^http:\/\/192\.168\.\d+\.\d+:3000$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/dev', require('./routes/devRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/coding-questions', codingQuestionRoutes);
app.use('/api/attempts', interviewAttemptRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/code-execution', codeExecutionRoutes);
app.use('/api', executeRoutes);
app.use('/api/practice-questions', practiceQuestionRoutes);
app.use('/api/submissions', practiceSubmissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/coding-profiles', codingProfileRoutes);
app.use('/api', githubRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/video-lectures', videoLectureRoutes);
app.use('/api/student', studentRoutes);

// Dev-only routes (mount in dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev-auth', devAuthRoutes);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize WebSocket server
websocketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 WebSocket server ready on ws://localhost:${PORT}/dashboard-student`);
});

module.exports = app;