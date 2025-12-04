require('dotenv').config();
const connectDB = require('../config/database');
const seedArrayQuestions = require('./arrayQuestions');

(async () => {
  try {
    await connectDB();
    await seedArrayQuestions();
    console.log('✅ Array practice questions seeding finished');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding array questions only:', error);
    process.exit(1);
  }
})();
