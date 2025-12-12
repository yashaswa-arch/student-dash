require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const Video = require('../src/models/Video');
const VideoQuiz = require('../src/models/VideoQuiz');
const Series = require('../src/models/Series');
const Topic = require('../src/models/Topic');
const { initializeGemini, generateQuizWithGemini, buildSegmentSummary, formatTimestamp, shouldPublishQuiz } = require('../src/services/geminiQuizService');

/**
 * Setup quizzes for a specific YouTube video
 * Usage: node scripts/setupQuizForVideo.js <videoId or YouTube URL>
 */

const setupQuiz = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();

    // Get video ID or URL from command line
    const input = process.argv[2];
    if (!input) {
      console.error('❌ Please provide a video ID or YouTube URL');
      console.error('   Usage: node scripts/setupQuizForVideo.js <videoId or YouTube URL>');
      process.exit(1);
    }

    console.log(`\n📹 Looking for video: ${input}\n`);

    // Extract YouTube video ID if URL provided
    let youtubeId = null;
    let video = null;
    let searchInput = input;

    if (input.startsWith('http')) {
      // Extract YouTube ID from URL
      const match = input.match(/(?:v=|youtu\.be\/|\/embed\/|watch\?v=)?([A-Za-z0-9_-]{11})/);
      if (match && match[1]) {
        youtubeId = match[1];
        console.log(`✅ Extracted YouTube ID: ${youtubeId}`);
        searchInput = youtubeId; // Use YouTube ID for searching
      } else {
        console.error('❌ Could not extract YouTube ID from URL');
        process.exit(1);
      }
    } else {
      // Could be MongoDB ID or videoId
      youtubeId = input;
      searchInput = input;
    }

    // Find video - try MongoDB _id first (only if it looks like an ObjectId)
    if (searchInput.length === 24 && /^[0-9a-fA-F]{24}$/.test(searchInput)) {
      video = await Video.findById(searchInput);
    }
    
    // Try by videoId field
    if (!video) {
      video = await Video.findOne({ videoId: searchInput });
    }
    
    // Try by src containing the YouTube ID
    if (!video && youtubeId) {
      video = await Video.findOne({ src: { $regex: youtubeId } });
    }

    if (!video) {
      console.error('❌ Video not found in database');
      console.error('   Please insert the video first using: node scripts/insertVideoLecture.js');
      process.exit(1);
    }

    console.log(`✅ Found video: ${video.title}`);
    console.log(`   Video ID: ${video._id}`);
    console.log(`   YouTube ID: ${video.videoId || 'N/A'}`);
    console.log(`   Duration: ${video.durationSeconds ? Math.floor(video.durationSeconds / 60) + ':' + (video.durationSeconds % 60).toString().padStart(2, '0') : 'N/A'}`);

    // Check if video has segment timestamps
    if (!video.segmentTimestamps || video.segmentTimestamps.length === 0) {
      console.log('\n⚠️  Video has no segment timestamps. Generating timestamps...');
      
      // Auto-generate timestamps
      const duration = video.durationSeconds || 600; // Default to 10 minutes if unknown
      const numQuizzes = 6;
      const startOffset = 30;
      const endOffset = 30;
      const availableDuration = duration - startOffset - endOffset;
      const interval = availableDuration / (numQuizzes + 1);
      
      const timestamps = [];
      for (let i = 1; i <= numQuizzes; i++) {
        timestamps.push(Math.round(startOffset + (interval * i)));
      }
      
      video.segmentTimestamps = timestamps;
      await video.save();
      console.log(`✅ Generated ${timestamps.length} timestamps:`, timestamps.map(t => {
        const mins = Math.floor(t / 60);
        const secs = t % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }).join(', '));
    } else {
      console.log(`\n✅ Video has ${video.segmentTimestamps.length} segment timestamps`);
    }

    // Check for existing quizzes
    const existingQuizzes = await VideoQuiz.find({ video: video._id });
    console.log(`\n📊 Existing quizzes: ${existingQuizzes.length}`);

    if (existingQuizzes.length > 0) {
      console.log('   Existing quiz timestamps:');
      existingQuizzes.forEach(q => {
        const mins = Math.floor(q.timestamp / 60);
        const secs = q.timestamp % 60;
        console.log(`   - ${mins}:${secs.toString().padStart(2, '0')} - ${q.isPublished ? '✅ Published' : '❌ Unpublished'}`);
      });
    }

    // Check for GOOGLE_API_KEY
    if (!process.env.GOOGLE_API_KEY) {
      console.error('\n❌ GOOGLE_API_KEY is not set in environment variables');
      console.error('   Please set it in backend/.env file: GOOGLE_API_KEY=your_key_here');
      process.exit(1);
    }

    // Initialize Gemini
    console.log('\n🚀 Initializing Gemini API...');
    try {
      initializeGemini();
      console.log('✅ Gemini initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error.message);
      process.exit(1);
    }

    // Populate series to get topic
    await video.populate('series');
    const series = await Series.findById(video.series).populate('topic');
    const topic = series?.topic?.name || 'Arrays';
    const subtopic = null;

    console.log(`\n📝 Generating quizzes for video: ${video.title}`);
    console.log(`📊 Found ${video.segmentTimestamps.length} segment timestamps`);
    console.log(`📚 Topic: ${topic}`);
    console.log('   This may take a few minutes...\n');

    const results = { 
      total: video.segmentTimestamps.length, 
      generated: 0, 
      failed: 0, 
      published: 0, 
      unpublished: 0, 
      quizzes: [] 
    };

    // Generate quizzes for each timestamp
    for (const timestamp of video.segmentTimestamps) {
      try {
        console.log(`\n⏱️  Generating quiz for timestamp: ${formatTimestamp(timestamp)}`);
        const segmentSummary = buildSegmentSummary(timestamp, subtopic);
        console.log(`📋 Segment summary: ${segmentSummary}`);
        
        const quizData = await generateQuizWithGemini(topic, subtopic, segmentSummary);
        const shouldPublish = await shouldPublishQuiz(segmentSummary, quizData.question_text, quizData.confidence);
        
        const existingQuiz = await VideoQuiz.findOne({ video: video._id, timestamp: timestamp });
        let quiz;
        
        if (existingQuiz) {
          existingQuiz.question = quizData.question_text;
          existingQuiz.options = quizData.options;
          existingQuiz.correctIndex = quizData.correct_option_index;
          existingQuiz.explanation = quizData.explanation || '';
          existingQuiz.difficulty = quizData.difficulty;
          existingQuiz.confidence = quizData.confidence;
          existingQuiz.isPublished = shouldPublish;
          await existingQuiz.save();
          quiz = existingQuiz;
          console.log(`✅ Updated existing quiz`);
        } else {
          quiz = new VideoQuiz({ 
            video: video._id, 
            timestamp: timestamp, 
            question: quizData.question_text, 
            options: quizData.options, 
            correctIndex: quizData.correct_option_index, 
            explanation: quizData.explanation || '', 
            difficulty: quizData.difficulty, 
            confidence: quizData.confidence, 
            isPublished: shouldPublish 
          });
          await quiz.save();
          console.log(`✅ Created new quiz`);
        }
        
        results.generated++;
        if (shouldPublish) results.published++;
        else results.unpublished++;
        
        results.quizzes.push({ 
          timestamp: timestamp, 
          timestampFormatted: formatTimestamp(timestamp), 
          question: quiz.question, 
          difficulty: quiz.difficulty, 
          confidence: quiz.confidence, 
          isPublished: quiz.isPublished, 
          quizId: quiz._id 
        });
        
        console.log(`   Question: ${quiz.question.substring(0, 60)}...`);
        console.log(`   Difficulty: ${quiz.difficulty}, Confidence: ${quiz.confidence.toFixed(2)}`);
        console.log(`   Published: ${quiz.isPublished ? '✅' : '❌'}`);
      } catch (error) {
        console.error(`❌ Failed to generate quiz for timestamp ${timestamp}:`, error.message);
        results.failed++;
        results.quizzes.push({ 
          timestamp: timestamp, 
          timestampFormatted: formatTimestamp(timestamp), 
          error: error.message 
        });
      }
    }

    console.log('\n📊 Generation Summary:');
    console.log(`   Total: ${results.total}`);
    console.log(`   Generated: ${results.generated}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Published: ${results.published}`);
    console.log(`   Unpublished: ${results.unpublished}`);

    // Verify quizzes in database
    const allQuizzes = await VideoQuiz.find({ video: video._id });
    const publishedQuizzes = allQuizzes.filter(q => q.isPublished);
    console.log(`\n✅ Database verification:`);
    console.log(`   Total quizzes: ${allQuizzes.length}`);
    console.log(`   Published quizzes: ${publishedQuizzes.length}`);
    
    if (publishedQuizzes.length > 0) {
      console.log(`\n📝 Published Quizzes:`);
      publishedQuizzes.forEach((q, idx) => {
        const mins = Math.floor(q.timestamp / 60);
        const secs = q.timestamp % 60;
        console.log(`   ${idx + 1}. ${mins}:${secs.toString().padStart(2, '0')} - ${q.question.substring(0, 60)}...`);
      });
    }
    
    console.log(`\n🎉 Quizzes are ready! The video will show pop-up quizzes during playback.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
};

if (require.main === module) {
  setupQuiz();
}

module.exports = setupQuiz;

