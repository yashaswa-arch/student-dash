require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const Video = require('../src/models/Video');
const Series = require('../src/models/Series');

(async () => {
  try {
    await connectDB();
    
    // Find the Arrays series
    const series = await Series.findOne({ title: 'Arrays' });
    if (!series) {
      console.log('❌ Arrays series not found');
      process.exit(1);
    }
    
    console.log('✅ Series found:');
    console.log('  ID:', series._id);
    console.log('  Title:', series.title);
    console.log('  Published:', series.isPublished);
    console.log('  Topic:', series.topic);
    
    // Find all videos in this series
    const allVideos = await Video.find({ series: series._id });
    console.log('\n📹 All videos in Arrays series:', allVideos.length);
    allVideos.forEach(v => {
      console.log(`  - ${v.title}`);
      console.log(`    ID: ${v._id}`);
      console.log(`    Published: ${v.isPublished}`);
      console.log(`    Series: ${v.series}`);
      console.log(`    Video ID: ${v.videoId}`);
    });
    
    // Find only published videos
    const publishedVideos = await Video.find({ series: series._id, isPublished: true });
    console.log('\n✅ Published videos:', publishedVideos.length);
    publishedVideos.forEach(v => {
      console.log(`  - ${v.title} (${v._id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();

