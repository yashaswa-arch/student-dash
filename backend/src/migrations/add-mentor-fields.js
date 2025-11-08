/**
 * Migration script to add mentor-specific fields to existing Question and User documents
 * 
 * Run this manually with: node backend/src/migrations/add-mentor-fields.js
 */

const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');

async function migrateQuestions() {
  console.log('🔄 Migrating Question documents...');
  
  try {
    // Add optimalApproach and optimalComplexity to questions that don't have them
    const result = await Question.updateMany(
      {
        $or: [
          { optimalApproach: { $exists: false } },
          { optimalComplexity: { $exists: false } }
        ]
      },
      {
        $set: {
          optimalApproach: 'Unknown',
          optimalComplexity: { time: 'O(n)', space: 'O(1)' }
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} questions with optimal approach/complexity`);
    
    // Update submissions with mentor fields if they have old AI analysis
    const questionsWithSubmissions = await Question.find({ 'submissions.0': { $exists: true } });
    
    let submissionsUpdated = 0;
    for (const question of questionsWithSubmissions) {
      let modified = false;
      
      question.submissions.forEach(sub => {
        if (sub.aiAnalysis && !sub.aiAnalysis.analysisSummary) {
          // Migrate old format to new format
          sub.aiAnalysis.analysisSummary = sub.aiAnalysis.explanation || 'Legacy submission';
          sub.aiAnalysis.approachDetected = 'Unknown';
          sub.aiAnalysis.correctness = sub.status === 'passed';
          sub.aiAnalysis.strengths = [];
          sub.aiAnalysis.weaknesses = [];
          sub.aiAnalysis.improvementSuggestions = sub.aiAnalysis.suggestions || [];
          sub.aiAnalysis.nextProblemRecommendation = { topic: 'Review basics', why: 'Legacy data' };
          sub.aiAnalysis.mindsetCoaching = 'Keep practicing!';
          
          modified = true;
          submissionsUpdated++;
        }
      });
      
      if (modified) {
        await question.save();
      }
    }
    
    console.log(`✅ Updated ${submissionsUpdated} submissions with mentor fields`);
    
  } catch (error) {
    console.error('❌ Error migrating questions:', error);
    throw error;
  }
}

async function migrateUsers() {
  console.log('🔄 Migrating User documents...');
  
  try {
    // Add codingHistory to users that don't have it
    const result = await User.updateMany(
      { codingHistory: { $exists: false } },
      {
        $set: {
          codingHistory: {
            recentPatterns: [],
            commonMistakes: [],
            masteredPatterns: [],
            previousWeakness: '',
            totalSubmissions: 0,
            optimalSolutions: 0
          }
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with coding history`);
    
  } catch (error) {
    console.error('❌ Error migrating users:', error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('🚀 Starting mentor fields migration...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-dash';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Run migrations
    await migrateQuestions();
    console.log('');
    await migrateUsers();
    
    console.log('\n✨ Migration completed successfully!');
    console.log('📊 Summary:');
    console.log('  - Questions updated with optimal approach/complexity fields');
    console.log('  - Submissions migrated to new mentor analysis format');
    console.log('  - Users initialized with coding history tracking');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateQuestions, migrateUsers, runMigration };
