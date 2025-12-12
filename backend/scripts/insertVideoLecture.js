require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const Topic = require('../src/models/Topic');
const Series = require('../src/models/Series');
const Video = require('../src/models/Video');
const axios = require('axios');

/**
 * Extract YouTube video ID from URL
 */
const extractYouTubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Get video duration from YouTube Data API
 */
const getYouTubeDuration = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log('⚠️  YOUTUBE_API_KEY not set. Duration will be null.');
    return null;
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        id: videoId,
        part: 'contentDetails',
        key: apiKey
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const duration = response.data.items[0].contentDetails.duration;
      // Parse ISO 8601 format: PT1H2M10S
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        return hours * 3600 + minutes * 60 + seconds;
      }
    }
  } catch (error) {
    console.error('❌ Error fetching YouTube duration:', error.message);
    return null;
  }

  return null;
};

/**
 * Calculate segment timestamps
 */
const calculateSegmentTimestamps = (durationSeconds, numQuizzes, startOffset, endOffset) => {
  if (!durationSeconds) {
    // If duration is null, use typical lecture length of 54 minutes (3240 seconds)
    console.log('⚠️  Duration not available. Using default 54 minutes (3240 seconds) for timestamp calculation.');
    durationSeconds = 3240;
  }

  const availableDuration = durationSeconds - startOffset - endOffset;
  if (availableDuration <= 0) {
    console.log('⚠️  Invalid duration or offsets. Cannot calculate timestamps.');
    return [];
  }

  const timestamps = [];
  if (numQuizzes > 0) {
    const interval = availableDuration / (numQuizzes + 1);
    for (let i = 1; i <= numQuizzes; i++) {
      timestamps.push(Math.round(startOffset + (interval * i)));
    }
  }

  return timestamps;
};

/**
 * Main function to insert video
 */
const insertVideo = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();

    // Video data
    const videoUrl = 'https://www.youtube.com/watch?v=8wmn7k1TTcI';
    const youtubeId = extractYouTubeId(videoUrl);
    
    if (!youtubeId) {
      throw new Error('Could not extract YouTube video ID from URL');
    }

    console.log(`📹 YouTube Video ID: ${youtubeId}`);

    // Create or find Topic "DSA"
    let topic = await Topic.findOne({ name: 'DSA' });
    if (!topic) {
      console.log('📁 Creating Topic: DSA');
      topic = new Topic({
        name: 'DSA',
        description: 'Data Structures and Algorithms',
        order: 0,
        isActive: true
      });
      await topic.save();
      console.log(`✅ Created Topic: ${topic._id}`);
    } else {
      console.log(`✅ Found existing Topic: ${topic._id}`);
    }

    // Create or find Series "Arrays" under DSA topic
    let series = await Series.findOne({ title: 'Arrays', topic: topic._id });
    if (!series) {
      console.log('📚 Creating Series: Arrays');
      series = new Series({
        title: 'Arrays',
        description: 'Array data structure lectures',
        topic: topic._id,
        order: 0,
        isPublished: true
      });
      await series.save();
      console.log(`✅ Created Series: ${series._id}`);
    } else {
      console.log(`✅ Found existing Series: ${series._id}`);
    }

    // Fetch duration from YouTube API
    console.log('⏱️  Fetching video duration from YouTube API...');
    const durationSeconds = await getYouTubeDuration(youtubeId);
    
    if (durationSeconds) {
      console.log(`✅ Duration: ${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')} (${durationSeconds} seconds)`);
    } else {
      console.log('⚠️  Duration: null (will use default for timestamp calculation)');
    }

    // Calculate segment timestamps
    const numQuizzes = 8;
    const startOffset = 60;
    const endOffset = 60;
    const segmentTimestamps = calculateSegmentTimestamps(durationSeconds, numQuizzes, startOffset, endOffset);
    console.log(`📊 Calculated ${segmentTimestamps.length} segment timestamps:`, segmentTimestamps);

    // Create Video record
    const videoData = {
      videoId: 'v-dsa-arrays-1',
      title: 'Arrays — Apna College (Lecture 1)',
      series: series._id,
      src: videoUrl.trim(),
      provider: 'youtube',
      videoId: youtubeId,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      durationSeconds: durationSeconds,
      segmentTimestamps: segmentTimestamps,
      order: 0,
      isPublished: true
    };

    // Check if video already exists
    const existingVideo = await Video.findOne({ videoId: 'v-dsa-arrays-1' });
    if (existingVideo) {
      console.log('⚠️  Video with videoId "v-dsa-arrays-1" already exists. Updating...');
      Object.assign(existingVideo, videoData);
      await existingVideo.save();
      await existingVideo.populate('series');
      console.log('✅ Video updated successfully!');
      console.log('\n📄 Video JSON:');
      console.log(JSON.stringify(existingVideo.toObject(), null, 2));
      process.exit(0);
    }

    const video = new Video(videoData);
    await video.save();
    await video.populate('series');

    console.log('✅ Video created successfully!');
    console.log(`📹 Video ID: ${video._id}`);
    console.log('\n📄 Video JSON:');
    console.log(JSON.stringify(video.toObject(), null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting video:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  insertVideo();
}

module.exports = insertVideo;

