// Test the Question Tracker API
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// You'll need to login first and get a token
// Replace this with actual token after login
const TOKEN = 'YOUR_TOKEN_HERE';

async function testQuestionTracker() {
  try {
    console.log('🧪 Testing Question Tracker API...\n');

    // Test 1: Create a question
    console.log('1️⃣ Creating a new question...');
    const newQuestion = {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      platform: 'leetcode',
      platformUrl: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'easy',
      tags: ['array', 'hash-table'],
      topics: ['array', 'hash-table'],
      testCases: [
        {
          input: '[2,7,11,15], target=9',
          expectedOutput: '[0,1]'
        },
        {
          input: '[3,2,4], target=6',
          expectedOutput: '[1,2]'
        }
      ],
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      ]
    };

    const createResponse = await axios.post(`${API_URL}/questions`, newQuestion, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Question created:', createResponse.data._id);
    const questionId = createResponse.data._id;

    // Test 2: Get all questions
    console.log('\n2️⃣ Fetching all questions...');
    const listResponse = await axios.get(`${API_URL}/questions`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log(`✅ Found ${listResponse.data.total} questions`);

    // Test 3: Get question stats
    console.log('\n3️⃣ Fetching stats...');
    const statsResponse = await axios.get(`${API_URL}/questions/stats`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Stats:', statsResponse.data);

    // Test 4: Submit a solution
    console.log('\n4️⃣ Submitting a solution...');
    const submission = {
      code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]`,
      language: 'python'
    };

    const submitResponse = await axios.post(
      `${API_URL}/questions/${questionId}/submit`,
      submission,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log('✅ Submission created with AI analysis');
    console.log('   Status:', submitResponse.data.status);
    console.log('   AI Score:', submitResponse.data.submission.aiAnalysis?.score || 'N/A');

    // Test 5: Get submissions
    console.log('\n5️⃣ Fetching submissions...');
    const submissionsResponse = await axios.get(
      `${API_URL}/questions/${questionId}/submissions`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log(`✅ Found ${submissionsResponse.data.length} submissions`);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Instructions
console.log('📝 SETUP INSTRUCTIONS:');
console.log('1. Login to get your token:');
console.log('   POST http://localhost:5000/api/auth/login');
console.log('   { "email": "your@email.com", "password": "your_password" }');
console.log('');
console.log('2. Copy the token from response');
console.log('3. Replace TOKEN variable in this file');
console.log('4. Run: node test-question-tracker.js');
console.log('');
console.log('Or use Postman/Thunder Client to test the API directly!');
console.log('');

// Uncomment to run (after adding token)
// testQuestionTracker();
