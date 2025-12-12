require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const Video = require('../src/models/Video');
const axios = require('axios');

/**
 * Test script to generate quizzes for a video
 * Usage: node scripts/testQuizGeneration.js <videoId>
 */

const testQuizGeneration = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();

    // Get video ID from command line or use default
    const videoId = process.argv[2] || '693bb930705015906eacddcb'; // Default from previous creation
    
    console.log(`📹 Looking for video with ID: ${videoId}`);
    
    // Find video
    let video = await Video.findById(videoId);
    if (!video) {
      video = await Video.findOne({ videoId: videoId });
    }
    
    if (!video) {
      console.error('❌ Video not found');
      process.exit(1);
    }

    console.log(`✅ Found video: ${video.title}`);
    console.log(`📊 Segment timestamps: ${video.segmentTimestamps.length}`);
    
    // Check for GOOGLE_API_KEY
    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY is not set in environment variables');
      console.error('   Please set it in backend/.env file: GOOGLE_API_KEY=your_key_here');
      process.exit(1);
    }

    console.log('\n🚀 Calling quiz generation endpoint...');
    
    // Call the API endpoint
    const response = await axios.post(
      `http://localhost:5000/api/video-lectures/${videoId}/generate-quizzes`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'test'}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Quiz generation completed!');
    console.log(JSON.stringify(response.data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  testQuizGeneration();
}

module.exports = testQuizGeneration;

