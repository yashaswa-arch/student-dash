require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Video = require('../src/models/Video');
const Series = require('../src/models/Series');
const Topic = require('../src/models/Topic');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/minor';

async function run() {
  try {
    await mongoose.connect(MONGO);
    console.log('Connected to MongoDB');

    // Find or create topic
    let topic = await Topic.findOne({ slug: 'dsa' });
    if (!topic) {
      topic = await Topic.findOneAndUpdate(
        { name: 'DSA' },
        { $setOnInsert: { name: 'DSA', slug: 'dsa', description: 'Data Structures and Algorithms', isActive: true } },
        { upsert: true, new: true }
      );
      console.log('Created topic: DSA');
    }

    // Find or create series
    let series = await Series.findOne({ title: 'Arrays', topic: topic._id });
    if (!series) {
      series = await Series.findOneAndUpdate(
        { title: 'Arrays', topic: topic._id },
        { 
          $setOnInsert: { 
            title: 'Arrays', 
            topic: topic._id, 
            description: 'Array lectures',
            isPublished: true
          } 
        },
        { upsert: true, new: true }
      );
      console.log('Created series: Arrays');
    }

    // Check if video exists
    const existing = await Video.findOne({ videoId: 'v-dsa-arrays-1' });
    if (!existing) {
      await Video.create({
        videoId: 'v-dsa-arrays-1', // Custom identifier for routing
        title: 'Arrays — Demo Lecture',
        series: series._id,
        src: 'https://www.youtube.com/watch?v=8wmn7k1TTcI',
        provider: 'youtube',
        thumbnail: 'https://img.youtube.com/vi/8wmn7k1TTcI/hqdefault.jpg',
        durationSeconds: 3240,
        segmentTimestamps: [300, 660, 1020, 1380, 1740, 2100, 2460, 2820],
        isPublished: true
      });
      console.log('✅ Seeded demo video');
    } else {
      console.log('✅ Demo video already present');
    }

    process.exit(0);
  } catch (e) {
    console.error('Error seeding video:', e);
    process.exit(1);
  }
}

run();

