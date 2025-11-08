const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/codolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function clearOldFeedback() {
  const LeetCodeQuestion = mongoose.model('LeetCodeQuestion', new mongoose.Schema({}, { strict: false }));
  
  console.log('🧹 Clearing old AI feedback from all questions...');
  
  const result = await LeetCodeQuestion.updateMany(
    {},
    { $set: { aiFeedback: null } }
  );
  
  console.log(`✅ Cleared feedback from ${result.modifiedCount} questions`);
  console.log('👉 Now re-analyze your code to get HONEST feedback!');
  
  await mongoose.connection.close();
  process.exit(0);
}

clearOldFeedback().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
