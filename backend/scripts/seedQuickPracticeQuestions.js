/**
 * Seed script for Quick Practice Questions
 * 
 * This script reads questions from quickPracticeQuestions.json and inserts them
 * into the database if they don't already exist (checked by title + topic).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const PracticeQuestion = require('../src/models/PracticeQuestion');
const fs = require('fs');
const path = require('path');

const QUESTIONS_FILE = path.join(__dirname, '../seed/quickPracticeQuestions.json');

async function seedQuickPracticeQuestions() {
  try {
    console.log('🌱 Starting Quick Practice Questions seed...\n');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Read questions from JSON file
    if (!fs.existsSync(QUESTIONS_FILE)) {
      throw new Error(`Questions file not found: ${QUESTIONS_FILE}`);
    }

    const questionsData = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    console.log(`📚 Loaded ${questionsData.length} questions from JSON file\n`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Process each question
    for (const questionData of questionsData) {
      try {
        // Check if question already exists (by title + topic)
        const existing = await PracticeQuestion.findOne({
          title: questionData.title,
          topic: questionData.topic
        });

        if (existing) {
          console.log(`⏭️  Skipped: "${questionData.title}" (${questionData.topic}) - already exists`);
          skipped++;
          continue;
        }

        // Prepare test cases
        // The schema expects testCases array with input, expectedOutput, isHidden
        const testCases = questionData.testCases.map((tc, idx) => {
          if (!tc.expectedOutput && tc.expectedOutput !== '') {
            throw new Error(`Test case ${idx} missing expectedOutput for question "${questionData.title}"`);
          }
          return {
            input: tc.input || '',
            expectedOutput: tc.expectedOutput !== undefined ? String(tc.expectedOutput) : '',
            isHidden: tc.isHidden || false
          };
        });

        // Create question document
        const question = new PracticeQuestion({
          title: questionData.title,
          topic: questionData.topic,
          difficulty: questionData.difficulty,
          description: questionData.description,
          sampleInput: questionData.sampleInput,
          sampleOutput: questionData.sampleOutput,
          constraints: questionData.constraints,
          testCases: testCases,
          order: questionData.order,
          starterCode: questionData.starterCode
        });

        await question.save();
        console.log(`✅ Inserted: "${questionData.title}" (${questionData.topic}, ${questionData.difficulty})`);
        inserted++;
      } catch (error) {
        console.error(`❌ Error processing "${questionData.title}": ${error.message}`);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Seeding Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Inserted: ${inserted} questions`);
    console.log(`⏭️  Skipped: ${skipped} questions (already exist)`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors} questions`);
    }
    console.log('='.repeat(60) + '\n');

    // Get final counts by topic
    const topicCounts = await PracticeQuestion.aggregate([
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('📋 Questions by Topic:');
    topicCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} questions`);
    });
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedQuickPracticeQuestions();

