require('dotenv').config();
const connectDB = require('../config/database');
const seedUsers = require('./users');
const seedCourses = require('./courses');
const seedCodingQuestions = require('./codingQuestions');

// Import new seeders
const { 
  Module, 
  Lesson, 
  Quiz, 
  Achievement,
  Settings,
  Course,
  User
} = require('../models');
const { modules, lessons, quizzes, achievements } = require('./expandedContent');
const { systemSettings } = require('./settings');

const seedExpandedContent = async () => {
  try {
    console.log('🌱 Seeding expanded content...');

    // Get existing courses and users for references
    const courses = await Course.find();
    const users = await User.find();

    if (courses.length === 0) {
      console.log('⚠️ No courses found. Run basic seeders first.');
      return;
    }

    // Clear expanded content collections
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Achievement.deleteMany({});
    await Settings.deleteMany({});

    // Seed modules with course references
    const modulesWithCourses = modules.map((module, index) => ({
      ...module,
      course: courses[index % courses.length]._id
    }));
    const seededModules = await Module.insertMany(modulesWithCourses);
    console.log(`✅ Seeded ${seededModules.length} modules`);

    // Seed lessons with module references
    const lessonsWithModules = lessons.map((lesson, index) => ({
      ...lesson,
      module: seededModules[index % seededModules.length]._id
    }));
    const seededLessons = await Lesson.insertMany(lessonsWithModules);
    console.log(`✅ Seeded ${seededLessons.length} lessons`);

    // Seed quizzes with course and module references
    const quizzesWithReferences = quizzes.map((quiz, index) => ({
      ...quiz,
      course: courses[index % courses.length]._id,
      module: seededModules[index % seededModules.length]._id
    }));
    const seededQuizzes = await Quiz.insertMany(quizzesWithReferences);
    console.log(`✅ Seeded ${seededQuizzes.length} quizzes`);

    // Seed achievements
    const seededAchievements = await Achievement.insertMany(achievements);
    console.log(`✅ Seeded ${seededAchievements.length} achievements`);

    // Seed system settings
    const seededSettings = await Settings.insertMany(systemSettings);
    console.log(`✅ Seeded ${seededSettings.length} system settings`);

    console.log('🎉 Expanded content seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding expanded content:', error);
    throw error;
  }
};

const runSeeders = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Run basic seeders first
    await seedUsers();
    await seedCourses();
    await seedCodingQuestions();
    
    // Then seed expanded content
    await seedExpandedContent();
    
    console.log('✅ Comprehensive database seeding completed successfully!');
    console.log('\n📋 Total Collections Seeded:');
    console.log('   ✓ Users & Authentication');
    console.log('   ✓ Courses & Content Structure');
    console.log('   ✓ Coding Questions & Assessments');
    console.log('   ✓ Modules & Lessons');
    console.log('   ✓ Quizzes & Evaluations');
    console.log('   ✓ Achievement System');
    console.log('   ✓ System Settings');
    console.log('\n🚀 Ready for AI-powered features!');
    
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