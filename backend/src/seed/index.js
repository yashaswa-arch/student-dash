require('dotenv').config();
const connectDB = require('../config/database');
const seedUsers = require('./users');
const seedCourses = require('./courses');
const seedCodingQuestions = require('./codingQuestions');

const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Run seeders in order (users first, then courses, then questions)
    await seedUsers();
    await seedCourses();
    await seedCodingQuestions();
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders;