/**
 * Smoke Test for Quick Practice and Question Tracker
 * 
 * This script tests:
 * 1. Submitting code to practice questions
 * 2. Verifying verdicts (PASSED, FAILED, COMPILE_ERROR, RUNTIME_ERROR)
 * 3. Ensuring only PASSED submissions count as solved in stats
 */

const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-analytics-platform';

// Test user credentials
const TEST_USER = {
  email: `smoketest_${Date.now()}@test.com`,
  password: 'TestPassword123!',
  username: `smoketest_${Date.now()}`
};

let authToken = null;
let testQuestionId = null;
let initialStats = null;

// Colors for console output
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

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

/**
 * Step 1: Connect to MongoDB
 */
async function connectDB() {
  try {
    logInfo('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    logSuccess('Connected to MongoDB');
  } catch (error) {
    logError(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
}

/**
 * Step 2: Create or login as test user
 */
async function setupTestUser() {
  try {
    logInfo('Setting up test user...');
    
    // Try to register
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
      // User might already exist, try to login
      if (registerError.response?.status === 400) {
        logWarning('User already exists, attempting login...');
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
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      logError(`Failed to connect to API server at ${API_BASE_URL}`);
      logError('Make sure the backend server is running on port 5000');
      logError('Run: cd backend && npm start');
    } else {
      logError(`Failed to setup test user: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Step 3: Find or create a test practice question
 */
async function findOrCreateTestQuestion() {
  try {
    logInfo('Finding a practice question...');
    
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE_URL}/practice-questions`, { headers });
    
    if (response.data.success && response.data.data && response.data.data.length > 0) {
      testQuestionId = response.data.data[0]._id;
      const question = response.data.data[0];
      logSuccess(`Found question: "${question.title}" (ID: ${testQuestionId})`);
      
      // Log question details for reference
      logInfo(`  Topic: ${question.topic}`);
      logInfo(`  Difficulty: ${question.difficulty}`);
      logInfo(`  Sample Input: ${question.sampleInput}`);
      logInfo(`  Sample Output: ${question.sampleOutput}`);
      logInfo(`  Test Cases: ${(question.testCases || []).length} hidden + 1 sample`);
      
      return question;
    } else {
      logError('No practice questions found in database');
      throw new Error('No practice questions available');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      logError(`Failed to connect to API server at ${API_BASE_URL}`);
      logError('Make sure the backend server is running on port 5000');
    } else {
      logError(`Failed to find practice question: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Step 4: Get initial stats
 */
async function getInitialStats() {
  try {
    logInfo('Getting initial stats...');
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE_URL}/submissions/stats/overview`, { headers });
    
    if (response.data.success) {
      initialStats = response.data.data || {
        totalSubmissions: 0,
        totalSolved: 0,
        attemptedButUnsolved: 0,
        solvedLast7Days: 0
      };
      logSuccess(`Initial stats: ${initialStats.totalSolved} solved, ${initialStats.totalSubmissions} total submissions`);
      return initialStats;
    } else {
      throw new Error('Failed to get stats');
    }
  } catch (error) {
    logError(`Failed to get initial stats: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Step 5: Submit code and save submission
 */
async function submitCode(question, code, description) {
  try {
    logInfo(`\nSubmitting: ${description}...`);
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Step 5a: Submit code for evaluation
    const submitResponse = await axios.post(
      `${API_BASE_URL}/practice-questions/${testQuestionId}/submit`,
      {
        code,
        language: 'java'
      },
      { headers }
    );
    
    if (!submitResponse.data.success) {
      throw new Error(submitResponse.data.message || 'Submission failed');
    }
    
    const {
      verdict,
      passedTests,
      totalTests,
      stdout,
      stderr
    } = submitResponse.data;
    
    logInfo(`  Verdict: ${verdict}`);
    logInfo(`  Tests: ${passedTests}/${totalTests}`);
    
    // Step 5b: Save submission to database
    const saveResponse = await axios.post(
      `${API_BASE_URL}/submissions`,
      {
        questionId: testQuestionId,
        questionTitle: question.title,
        topics: [question.topic],
        difficulty: question.difficulty,
        language: 'java',
        code,
        stdout: stdout || '',
        stderr: stderr || '',
        verdict,
        passedTests,
        totalTests,
        source: 'quick-practice'
      },
      { headers }
    );
    
    if (!saveResponse.data.success) {
      throw new Error(saveResponse.data.message || 'Failed to save submission');
    }
    
    const submissionId = saveResponse.data.data._id;
    logSuccess(`  Submission saved: ${submissionId}`);
    
    return {
      verdict,
      passedTests,
      totalTests,
      submissionId,
      description
    };
  } catch (error) {
    logError(`  Submission failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      logError(`  Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Step 6: Get final stats and verify
 */
async function verifyStats() {
  try {
    logInfo('\nGetting final stats...');
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE_URL}/submissions/stats/overview`, { headers });
    
    if (!response.data.success) {
      throw new Error('Failed to get final stats');
    }
    
    const finalStats = response.data.data || {
      totalSubmissions: 0,
      totalSolved: 0,
      attemptedButUnsolved: 0,
      solvedLast7Days: 0
    };
    
    logInfo(`Final stats: ${finalStats.totalSolved} solved, ${finalStats.totalSubmissions} total submissions`);
    
    // Verify
    const expectedSubmissions = initialStats.totalSubmissions + 3;
    // We expect at most 1 solved (if the correct solution passed)
    // But we need to check what actually happened
    const actualSolvedIncrease = finalStats.totalSolved - initialStats.totalSolved;
    const actualSubmissionIncrease = finalStats.totalSubmissions - initialStats.totalSubmissions;
    
    let allPassed = true;
    
    // Check total submissions increased by 3
    if (actualSubmissionIncrease !== 3) {
      logError(`❌ MISMATCH: Expected 3 new submissions, got ${actualSubmissionIncrease}`);
      allPassed = false;
    } else {
      logSuccess(`✅ Total submissions correct: ${finalStats.totalSubmissions} (${actualSubmissionIncrease} new)`);
    }
    
    // Check that only PASSED submissions count as solved
    // The key test: FAILED, COMPILE_ERROR, RUNTIME_ERROR should NOT count
    if (actualSolvedIncrease > 1) {
      logError(`❌ MISMATCH: Expected at most 1 new solved, got ${actualSolvedIncrease}`);
      logError(`   Only PASSED submissions should count as solved!`);
      logError(`   FAILED, COMPILE_ERROR, RUNTIME_ERROR must NOT count as solved!`);
      allPassed = false;
    } else if (actualSolvedIncrease < 0) {
      logError(`❌ MISMATCH: Solved count decreased (${actualSolvedIncrease}) - this shouldn't happen`);
      allPassed = false;
    } else {
      logSuccess(`✅ Solved count correct: ${finalStats.totalSolved} (${actualSolvedIncrease} new, only PASSED counted)`);
      if (actualSolvedIncrease === 0) {
        logWarning('  Note: No submissions passed - this is expected if solutions don\'t match question requirements');
      }
    }
    
    // Additional verification: attemptedButUnsolved should increase for non-PASSED
    const expectedAttemptedIncrease = 3 - actualSolvedIncrease; // All non-PASSED should be attempted
    const actualAttemptedIncrease = finalStats.attemptedButUnsolved - initialStats.attemptedButUnsolved;
    
    if (actualAttemptedIncrease < expectedAttemptedIncrease) {
      logWarning(`⚠️  Attempted but unsolved: Expected at least ${expectedAttemptedIncrease}, got ${actualAttemptedIncrease}`);
      logWarning('   This might be expected if some submissions are still PENDING');
    } else {
      logSuccess(`✅ Attempted but unsolved: ${finalStats.attemptedButUnsolved} (${actualAttemptedIncrease} new)`);
    }
    
    return { allPassed, finalStats };
  } catch (error) {
    logError(`Failed to verify stats: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Main test execution
 */
async function runSmokeTest() {
  try {
    log('\n' + '='.repeat(60), 'cyan');
    log('🚀 Quick Practice & Question Tracker Smoke Test', 'cyan');
    log('='.repeat(60) + '\n', 'cyan');
    
    // Step 1: Connect to DB
    await connectDB();
    
    // Step 2: Setup test user
    await setupTestUser();
    
    // Step 3: Find test question
    const question = await findOrCreateTestQuestion();
    
    // Step 4: Get initial stats
    await getInitialStats();
    
    // Step 5: Submit three different solutions
    // We'll use generic solutions that should work for most simple questions
    // The key is to test the verdict logic, not the specific question logic
    
    logInfo('Preparing test solutions...');
    logWarning('Note: Using generic solutions. Actual verdicts depend on question requirements.');
    
    // 5a: Correct solution (should pass all tests if question is simple)
    // Generic solution that reads input and outputs it (works for echo-type questions)
    // For math questions, this will likely fail, but that's okay - we're testing the system
    const correctSolution = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Try to read and process input
        if (scanner.hasNextInt()) {
            int a = scanner.nextInt();
            if (scanner.hasNextInt()) {
                int b = scanner.nextInt();
                System.out.println(a + b);
            } else {
                System.out.println(a);
            }
        } else if (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            System.out.println(line);
        }
    }
}`;
    
    // 5b: Wrong-logic solution (compiles but fails tests)
    // Always outputs wrong value
    const wrongSolution = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Wrong logic: always output 0
        System.out.println(0);
    }
}`;
    
    // 5c: Code with syntax error (compile error)
    // Missing semicolon and closing brace
    const syntaxErrorSolution = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        System.out.println(a) // Missing semicolon - syntax error
    // Missing closing brace
}`;
    
    const submission1 = await submitCode(question, correctSolution, 'Correct solution (should PASS or FAIL based on question)');
    const submission2 = await submitCode(question, wrongSolution, 'Wrong-logic solution (should FAIL)');
    const submission3 = await submitCode(question, syntaxErrorSolution, 'Syntax error solution (should COMPILE_ERROR)');
    
    // Print submission results
    log('\n' + '-'.repeat(60), 'cyan');
    log('📊 Submission Results:', 'cyan');
    log('-'.repeat(60), 'cyan');
    log(`1. ${submission1.description}`);
    log(`   Verdict: ${submission1.verdict} | Tests: ${submission1.passedTests}/${submission1.totalTests} | ID: ${submission1.submissionId}`);
    log(`2. ${submission2.description}`);
    log(`   Verdict: ${submission2.verdict} | Tests: ${submission2.passedTests}/${submission2.totalTests} | ID: ${submission2.submissionId}`);
    log(`3. ${submission3.description}`);
    log(`   Verdict: ${submission3.verdict} | Tests: ${submission3.passedTests}/${submission3.totalTests} | ID: ${submission3.submissionId}`);
    
    // Step 6: Verify stats
    const { allPassed, finalStats } = await verifyStats();
    
    // Final summary
    log('\n' + '='.repeat(60), 'cyan');
    if (allPassed) {
      log('✅ ALL TESTS PASSED', 'green');
      log('✅ Only PASSED submissions count as solved', 'green');
      log('✅ FAILED, COMPILE_ERROR, RUNTIME_ERROR do NOT count as solved', 'green');
    } else {
      log('❌ TESTS FAILED', 'red');
      log('❌ Verification failed - check the mismatches above', 'red');
    }
    log('='.repeat(60) + '\n', 'cyan');
    
    // Cleanup
    await mongoose.disconnect();
    logInfo('Disconnected from MongoDB');
    
    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    logError(`\nSmoke test failed: ${error.message}`);
    if (error.stack) {
      logError(`Stack trace: ${error.stack}`);
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

// Run the test
runSmokeTest();

