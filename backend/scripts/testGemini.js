require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const Video = require('../src/models/Video');
const { initializeGemini, generateQuizWithGemini } = require('../src/services/geminiQuizService');

/**
 * Test Gemini API connection and quiz generation
 */

const testGemini = async () => {
  try {
    console.log('🧪 Testing Gemini API Integration\n');
    
    // Step 1: Check API Key
    console.log('1️⃣ Checking API Key...');
    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY is not set in environment variables');
      console.error('   Please set it in backend/.env file: GOOGLE_API_KEY=your_key_here');
      console.error('   Get your API key from: https://makersuite.google.com/app/apikey');
      process.exit(1);
    }
    console.log('✅ GOOGLE_API_KEY is set');
    console.log(`   Key preview: ${process.env.GOOGLE_API_KEY.substring(0, 10)}...\n`);
    
    // Step 2: Initialize Gemini
    console.log('2️⃣ Initializing Gemini...');
    try {
      const genAI = initializeGemini();
      console.log('✅ Gemini initialized successfully\n');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error.message);
      process.exit(1);
    }
    
    // Step 3: Test quiz generation
    console.log('3️⃣ Testing quiz generation...');
    const testPrompt = {
      topic: 'Arrays',
      subtopic: 'Introduction',
      segmentSummary: 'Arrays segment near 0:30'
    };
    
    console.log('   Generating test quiz...');
    const quizData = await generateQuizWithGemini(
      testPrompt.topic,
      testPrompt.subtopic,
      testPrompt.segmentSummary
    );
    
    console.log('✅ Quiz generated successfully!');
    console.log('\n📝 Generated Quiz:');
    console.log(`   Question: ${quizData.question_text}`);
    console.log(`   Options: ${quizData.options.length} options`);
    quizData.options.forEach((opt, idx) => {
      const marker = idx === quizData.correct_option_index ? '✓' : ' ';
      console.log(`   ${marker} ${idx + 1}. ${opt}`);
    });
    console.log(`   Difficulty: ${quizData.difficulty}`);
    console.log(`   Confidence: ${quizData.confidence.toFixed(2)}`);
    if (quizData.explanation) {
      console.log(`   Explanation: ${quizData.explanation.substring(0, 100)}...`);
    }
    
    // Step 4: Check for videos with timestamps
    console.log('\n4️⃣ Checking for videos with segment timestamps...');
    await connectDB();
    const allVideos = await Video.find({}).limit(10).select('_id title segmentTimestamps videoId');
    const videosWithTimestamps = allVideos.filter(v => 
      v.segmentTimestamps && Array.isArray(v.segmentTimestamps) && v.segmentTimestamps.length > 0
    );
    
    if (videosWithTimestamps.length > 0) {
      console.log(`✅ Found ${videosWithTimestamps.length} video(s) with timestamps:`);
      videosWithTimestamps.forEach(video => {
        console.log(`   - ${video.title} (ID: ${video._id})`);
        console.log(`     Timestamps: ${video.segmentTimestamps.length} segments`);
      });
      console.log('\n💡 To generate quizzes for a video, use:');
      console.log(`   POST /api/video-lectures/${videosWithTimestamps[0]._id}/generate-quizzes`);
      console.log('   (Requires admin authentication)');
    } else {
      console.log('⚠️  No videos found with segment timestamps');
      console.log('   Create a video and set timestamps first using:');
      console.log('   POST /api/video-lectures/:videoId/auto-timestamps');
    }
    
    console.log('\n✅ All tests passed! Gemini is active and working.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
};

if (require.main === module) {
  testGemini();
}

module.exports = testGemini;

