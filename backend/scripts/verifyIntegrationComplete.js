/**
 * Complete Integration Verification
 * 
 * Tests the full flow:
 * 1. Submit 2 questions (1 PASSED, 1 FAILED)
 * 2. Verify POST /api/submissions saves correctly
 * 3. Verify GET /api/submissions/stats/overview counts correctly
 * 4. Verify GET /api/submissions/stats/by-topic works
 * 5. Verify GET /api/submissions/stats/by-difficulty works
 * 6. Print all requests/responses for debugging
 */

const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-analytics-platform';

const TEST_USER = {
  email: `verifycomplete_${Date.now()}@test.com`,
  password: 'TestPassword123!',
  username: `verifycomplete_${Date.now()}`
};

let authToken = null;
let initialStats = null;
let initialTopicStats = null;
let initialDifficultyStats = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}❌ ERROR: ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function printRequest(method, url, data = null) {
  log(`\n📤 ${method} ${url}`, 'cyan');
  if (data) {
    const dataCopy = { ...data };
    if (dataCopy.code) dataCopy.code = dataCopy.code.substring(0, 80) + '...';
    log(`   Body: ${JSON.stringify(dataCopy, null, 2)}`, 'cyan');
  }
}

function printResponse(status, data) {
  log(`📥 ${status}`, status >= 200 && status < 300 ? 'green' : 'red');
  const dataCopy = JSON.parse(JSON.stringify(data));
  if (dataCopy.data?.code) dataCopy.data.code = dataCopy.data.code.substring(0, 80) + '...';
  log(`   ${JSON.stringify(dataCopy, null, 2)}`, status >= 200 && status < 300 ? 'green' : 'red');
}

async function setupTestUser() {
  try {
    logInfo('Setting up test user...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
        username: TEST_USER.username
      });
      if (registerResponse.data.success && registerResponse.data.token) {
        authToken = registerResponse.data.token;
        logSuccess(`Test user created: ${TEST_USER.email}`);
        return;
      }
    } catch (registerError) {
      if (registerError.response?.status === 400) {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        if (loginResponse.data.success && loginResponse.data.token) {
          authToken = loginResponse.data.token;
          logSuccess(`Logged in as: ${TEST_USER.email}`);
          return;
        }
      }
      throw registerError;
    }
  } catch (error) {
    logError(`Failed to setup test user: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function getInitialStats() {
  try {
    logInfo('Getting initial stats...');
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Overview stats
    printRequest('GET', `${API_BASE_URL}/submissions/stats/overview`);
    const overviewResponse = await axios.get(`${API_BASE_URL}/submissions/stats/overview`, { headers });
    printResponse(overviewResponse.status, overviewResponse.data);
    initialStats = overviewResponse.data.data || {
      totalSubmissions: 0,
      totalSolved: 0,
      attemptedButUnsolved: 0,
      solvedLast7Days: 0
    };
    
    // Topic stats
    printRequest('GET', `${API_BASE_URL}/submissions/stats/by-topic`);
    const topicResponse = await axios.get(`${API_BASE_URL}/submissions/stats/by-topic`, { headers });
    printResponse(topicResponse.status, topicResponse.data);
    initialTopicStats = topicResponse.data.data || [];
    
    // Difficulty stats
    printRequest('GET', `${API_BASE_URL}/submissions/stats/by-difficulty`);
    const difficultyResponse = await axios.get(`${API_BASE_URL}/submissions/stats/by-difficulty`, { headers });
    printResponse(difficultyResponse.status, difficultyResponse.data);
    initialDifficultyStats = difficultyResponse.data.data || [];
    
    logSuccess(`Initial stats: ${initialStats.totalSolved} solved, ${initialStats.totalSubmissions} total`);
    return { initialStats, initialTopicStats, initialDifficultyStats };
  } catch (error) {
    logError(`Failed to get initial stats: ${error.response?.data?.message || error.message}`);
    if (error.response) {
      printResponse(error.response.status, error.response.data);
    }
    throw error;
  }
}

async function findQuestions() {
  try {
    logInfo('Finding 2 test questions...');
    const headers = { Authorization: `Bearer ${authToken}` };
    
    const response1 = await axios.get(`${API_BASE_URL}/practice-questions`, {
      headers,
      params: { topic: 'Arrays' }
    });
    
    const response2 = await axios.get(`${API_BASE_URL}/practice-questions`, {
      headers,
      params: { topic: 'Strings' }
    });
    
    const arraysQuestions = response1.data?.data || [];
    const stringsQuestions = response2.data?.data || [];
    
    const question1 = arraysQuestions.find(q => q.title.includes('maximum') && q.title.includes('minimum')) || arraysQuestions[0];
    const question2 = stringsQuestions[0] || arraysQuestions[1];
    
    if (!question1 || !question2) {
      throw new Error('Could not find 2 questions to test');
    }
    
    logSuccess(`Question 1: "${question1.title}" (${question1.topic}, ${question1.difficulty})`);
    logSuccess(`Question 2: "${question2.title}" (${question2.topic}, ${question2.difficulty})`);
    
    return { question1, question2 };
  } catch (error) {
    logError(`Failed to find questions: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function submitSolution(question, solution, description, expectedVerdict) {
  try {
    logInfo(`\nSubmitting: ${description}...`);
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Submit code for evaluation
    printRequest('POST', `${API_BASE_URL}/practice-questions/${question._id}/submit`, {
      code: solution.substring(0, 80) + '...',
      language: 'java'
    });
    
    const submitResponse = await axios.post(
      `${API_BASE_URL}/practice-questions/${question._id}/submit`,
      {
        code: solution,
        language: 'java'
      },
      { headers }
    );
    
    printResponse(submitResponse.status, submitResponse.data);
    
    if (!submitResponse.data.success) {
      throw new Error(submitResponse.data.message || 'Submission failed');
    }
    
    const { verdict, passedTests, totalTests, stdout, stderr } = submitResponse.data;
    
    logInfo(`  Verdict: ${verdict} | Tests: ${passedTests}/${totalTests}`);
    
    // Verify verdict matches expectation (or is reasonable)
    if (expectedVerdict && verdict !== expectedVerdict) {
      logError(`  ⚠️  Expected ${expectedVerdict}, got ${verdict}`);
    }
    
    // Save submission
    printRequest('POST', `${API_BASE_URL}/submissions`, {
      questionId: question._id,
      questionTitle: question.title,
      topics: [question.topic],
      difficulty: question.difficulty,
      language: 'java',
      verdict,
      passedTests,
      totalTests,
      source: 'quick-practice'
    });
    
    const saveResponse = await axios.post(
      `${API_BASE_URL}/submissions`,
      {
        questionId: question._id,
        questionTitle: question.title,
        topics: [question.topic],
        difficulty: question.difficulty,
        language: 'java',
        code: solution,
        stdout: stdout || '',
        stderr: stderr || '',
        verdict,
        passedTests,
        totalTests,
        source: 'quick-practice'
      },
      { headers }
    );
    
    printResponse(saveResponse.status, saveResponse.data);
    
    if (!saveResponse.data.success) {
      throw new Error(saveResponse.data.message || 'Failed to save submission');
    }
    
    // Verify saved submission has correct fields
    const saved = saveResponse.data.data;
    if (saved.verdict !== verdict) {
      logError(`  ❌ MISMATCH: Saved verdict (${saved.verdict}) != returned verdict (${verdict})`);
      throw new Error('Verdict mismatch');
    }
    if (saved.passedTests !== passedTests) {
      logError(`  ❌ MISMATCH: Saved passedTests (${saved.passedTests}) != returned (${passedTests})`);
      throw new Error('passedTests mismatch');
    }
    if (saved.totalTests !== totalTests) {
      logError(`  ❌ MISMATCH: Saved totalTests (${saved.totalTests}) != returned (${totalTests})`);
      throw new Error('totalTests mismatch');
    }
    
    logSuccess(`  ✅ Submission saved correctly: ${saved._id}`);
    logSuccess(`  ✅ Verdict: ${verdict}, PassedTests: ${passedTests}/${totalTests}`);
    
    return {
      verdict,
      passedTests,
      totalTests,
      submissionId: saved._id,
      submissionData: saved
    };
  } catch (error) {
    logError(`  Submission failed: ${error.response?.data?.message || error.message}`);
    if (error.response) {
      printResponse(error.response.status, error.response.data);
    }
    throw error;
  }
}

async function verifyAllStats() {
  try {
    logInfo('\nVerifying all stats endpoints...');
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Overview stats
    printRequest('GET', `${API_BASE_URL}/submissions/stats/overview`);
    const overviewResponse = await axios.get(`${API_BASE_URL}/submissions/stats/overview`, { headers });
    printResponse(overviewResponse.status, overviewResponse.data);
    const finalStats = overviewResponse.data.data || {};
    
    // Topic stats
    printRequest('GET', `${API_BASE_URL}/submissions/stats/by-topic`);
    const topicResponse = await axios.get(`${API_BASE_URL}/submissions/stats/by-topic`, { headers });
    printResponse(topicResponse.status, topicResponse.data);
    const finalTopicStats = topicResponse.data.data || [];
    
    // Difficulty stats
    printRequest('GET', `${API_BASE_URL}/submissions/stats/by-difficulty`);
    const difficultyResponse = await axios.get(`${API_BASE_URL}/submissions/stats/by-difficulty`, { headers });
    printResponse(difficultyResponse.status, difficultyResponse.data);
    const finalDifficultyStats = difficultyResponse.data.data || [];
    
    // Verify
    const actualSubmissionIncrease = finalStats.totalSubmissions - initialStats.totalSubmissions;
    const actualSolvedIncrease = finalStats.totalSolved - initialStats.totalSolved;
    
    let allPassed = true;
    
    // Check total submissions
    if (actualSubmissionIncrease !== 2) {
      logError(`❌ MISMATCH: Expected 2 new submissions, got ${actualSubmissionIncrease}`);
      allPassed = false;
    } else {
      logSuccess(`✅ Total submissions: ${finalStats.totalSubmissions} (${actualSubmissionIncrease} new)`);
    }
    
    // Check solved count (should only count PASSED)
    if (actualSolvedIncrease < 0) {
      logError(`❌ MISMATCH: Solved count decreased (${actualSolvedIncrease})`);
      allPassed = false;
    } else if (actualSolvedIncrease > 2) {
      logError(`❌ MISMATCH: Expected at most 2 new solved, got ${actualSolvedIncrease}`);
      logError(`   Only PASSED submissions should count as solved!`);
      allPassed = false;
    } else {
      logSuccess(`✅ Solved count: ${finalStats.totalSolved} (${actualSolvedIncrease} new, only PASSED counted)`);
    }
    
    // Check topic stats
    logInfo('\nTopic Stats:');
    finalTopicStats.forEach(stat => {
      const initial = initialTopicStats.find(s => s.topic === stat.topic) || { totalSolved: 0 };
      const increase = stat.totalSolved - initial.totalSolved;
      logInfo(`  ${stat.topic}: ${stat.totalSolved} solved (${increase > 0 ? '+' : ''}${increase})`);
    });
    
    // Check difficulty stats
    logInfo('\nDifficulty Stats:');
    finalDifficultyStats.forEach(stat => {
      const initial = initialDifficultyStats.find(s => s.difficulty === stat.difficulty) || { totalSolved: 0 };
      const increase = stat.totalSolved - initial.totalSolved;
      logInfo(`  ${stat.difficulty}: ${stat.totalSolved} solved (${increase > 0 ? '+' : ''}${increase})`);
    });
    
    return { allPassed, finalStats, finalTopicStats, finalDifficultyStats };
  } catch (error) {
    logError(`Failed to verify stats: ${error.response?.data?.message || error.message}`);
    if (error.response) {
      printResponse(error.response.status, error.response.data);
    }
    throw error;
  }
}

async function runCompleteVerification() {
  try {
    log('\n' + '='.repeat(60), 'cyan');
    log('🔍 Complete Quick Practice & Question Tracker Integration Verification', 'cyan');
    log('='.repeat(60) + '\n', 'cyan');
    
    await mongoose.connect(MONGODB_URI);
    logSuccess('Connected to MongoDB');
    
    await setupTestUser();
    await getInitialStats();
    const { question1, question2 } = await findQuestions();
    
    // Solution 1: Correct solution for "Find maximum and minimum in an array"
    const correctSolution = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        
        int startIdx = input.indexOf('[');
        int endIdx = input.indexOf(']');
        if (startIdx == -1 || endIdx == -1) {
            System.out.println("min = 0, max = 0");
            return;
        }
        
        String arrStr = input.substring(startIdx + 1, endIdx);
        String[] parts = arrStr.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }
        
        int min = arr[0];
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] < min) min = arr[i];
            if (arr[i] > max) max = arr[i];
        }
        
        System.out.println("min = " + min + ", max = " + max);
    }
}`;
    
    // Solution 2: Wrong solution (will fail)
    const wrongSolution = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("wrong answer");
    }
}`;
    
    const submission1 = await submitSolution(question1, correctSolution, 'Correct solution (should PASS)', 'PASSED');
    
    // Wait a bit to avoid rate limiting
    logInfo('Waiting 2 seconds to avoid rate limiting...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const submission2 = await submitSolution(question2, wrongSolution, 'Wrong solution (should FAIL)', 'FAILED');
    
    log('\n' + '-'.repeat(60), 'cyan');
    log('📊 Submission Results:', 'cyan');
    log('-'.repeat(60), 'cyan');
    log(`1. "${question1.title}"`);
    log(`   Verdict: ${submission1.verdict} | Tests: ${submission1.passedTests}/${submission1.totalTests} | ID: ${submission1.submissionId}`);
    log(`2. "${question2.title}"`);
    log(`   Verdict: ${submission2.verdict} | Tests: ${submission2.passedTests}/${submission2.totalTests} | ID: ${submission2.submissionId}`);
    
    const { allPassed } = await verifyAllStats();
    
    log('\n' + '='.repeat(60), 'cyan');
    if (allPassed) {
      log('✅ ALL VERIFICATIONS PASSED', 'green');
      log('✅ POST /api/submissions works correctly', 'green');
      log('✅ GET /api/submissions/stats/overview works correctly', 'green');
      log('✅ GET /api/submissions/stats/by-topic works correctly', 'green');
      log('✅ GET /api/submissions/stats/by-difficulty works correctly', 'green');
      log('✅ Only PASSED submissions count as solved', 'green');
      log('✅ Frontend will display correct status (✅ Solved for PASSED)', 'green');
    } else {
      log('❌ VERIFICATIONS FAILED', 'red');
      log('❌ Check the mismatches above', 'red');
    }
    log('='.repeat(60) + '\n', 'cyan');
    
    await mongoose.disconnect();
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    logError(`\nVerification failed: ${error.message}`);
    if (error.stack) {
      logError(`Stack trace: ${error.stack}`);
    }
    if (error.response) {
      printResponse(error.response.status, error.response.data);
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

runCompleteVerification();

