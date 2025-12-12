require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const Video = require('../src/models/Video');
const Series = require('../src/models/Series');
const Topic = require('../src/models/Topic');

(async () => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    
    // Find DSA topic
    const topic = await Topic.findOne({ name: 'DSA' });
    if (!topic) {
      console.log('❌ DSA topic not found');
      process.exit(1);
    }
    console.log('✅ Topic found:', topic.name, topic._id);
    
    // Find Arrays series
    const series = await Series.findOne({ title: 'Arrays', topic: topic._id });
    if (!series) {
      console.log('❌ Arrays series not found');
      process.exit(1);
    }
    console.log('✅ Series found:', series.title, series._id);
    console.log('   Published:', series.isPublished);
    
    // Ensure series is published
    if (!series.isPublished) {
      series.isPublished = true;
      await series.save();
      console.log('✅ Series marked as published');
    }
    
    // Find videos
    const videos = await Video.find({ series: series._id });
    console.log(`\n📹 Found ${videos.length} videos in series:`);
    
    videos.forEach(v => {
      console.log(`  - ${v.title}`);
      console.log(`    ID: ${v._id}`);
      console.log(`    Published: ${v.isPublished}`);
      console.log(`    Video ID: ${v.videoId}`);
    });
    
    // Ensure all videos are published
    const unpublished = videos.filter(v => !v.isPublished);
    if (unpublished.length > 0) {
      console.log(`\n⚠️  Found ${unpublished.length} unpublished videos. Publishing them...`);
      for (const video of unpublished) {
        video.isPublished = true;
        await video.save();
        console.log(`✅ Published: ${video.title}`);
      }
    }
    
    // Check published videos
    const publishedVideos = await Video.find({ series: series._id, isPublished: true });
    console.log(`\n✅ Total published videos: ${publishedVideos.length}`);
    
    console.log('\n📋 Summary:');
    console.log(`   Series ID: ${series._id}`);
    console.log(`   Series Published: ${series.isPublished}`);
    console.log(`   Videos Published: ${publishedVideos.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();

