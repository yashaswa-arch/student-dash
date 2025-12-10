require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../src/config/database');
const PracticeQuestion = require('../src/models/PracticeQuestion');

async function deleteQuestion() {
  await connectDB();
  const result = await PracticeQuestion.deleteOne({ 
    title: 'Minimum window substring', 
    topic: 'Strings' 
  });
  console.log('Deleted:', result.deletedCount);
  process.exit(0);
}

deleteQuestion();

