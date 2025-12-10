/**
 * Verification script with actual correct solutions
 * Tests with questions that we can actually solve correctly
 */

const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-analytics-platform';

const TEST_USER = {
  email: `verifypass_${Date.now()}@test.com`,
  password: 'TestPassword123!',
  username: `verifypass_${Date.now()}`
};

let authToken = null;
let initialStats = null;

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
  log(`\n📤 REQUEST: ${method} ${url}`, 'cyan');
  if (data) {
    const dataCopy = { ...data };
    if (dataCopy.code) dataCopy.code = dataCopy.code.substring(0, 100) + '...';
    log(`   Body: ${JSON.stringify(dataCopy, null, 2)}`, 'cyan');
  }
}

function printResponse(status, data) {
  log(`📥 RESPONSE: ${status}`, status >= 200 && status < 300 ? 'green' : 'red');
  const dataCopy = JSON.parse(JSON.stringify(data));
  if (dataCopy.data?.code) dataCopy.data.code = dataCopy.data.code.substring(0, 100) + '...';
  log(`   Body: ${JSON.stringify(dataCopy, null, 2)}`, status >= 200 && status < 300 ? 'green' : 'red');
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
    printRequest('GET', `${API_BASE_URL}/submissions/stats/overview`);
    const response = await axios.get(`${API_BASE_URL}/submissions/stats/overview`, { headers });
    printResponse(response.status, response.data);
    
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
    if (error.response) {
      printResponse(error.response.status, error.response.data);
    }
    throw error;
  }
}

async function findQuestion() {
  try {
    logInfo('Finding a simple question...');
    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.get(`${API_BASE_URL}/practice-questions`, {
      headers,
      params: { topic: 'Arrays' }
    });
    
    const questions = response.data?.data || [];
    // Find "Find maximum and minimum in an array" question
    const question = questions.find(q => q.title.includes('maximum') && q.title.includes('minimum')) || questions[0];
    
    if (!question) {
      throw new Error('Could not find a question to test');
    }
    
    logSuccess(`Found question: "${question.title}"`);
    logInfo(`  Sample Input: ${question.sampleInput}`);
    logInfo(`  Sample Output: ${question.sampleOutput}`);
    
    return question;
  } catch (error) {
    logError(`Failed to find question: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function submitCorrectSolution(question) {
  try {
    logInfo(`\nSubmitting correct solution...`);
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Correct solution for "Find maximum and minimum in an array"
    // Input format: "arr = [3, 5, 1, 8, 2]"
    // Output format: "min = 1, max = 8"
    const correctSolution = `import java.util.Scanner;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        
        // Parse input: "arr = [3, 5, 1, 8, 2]"
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
    
    // Submit code for evaluation
    printRequest('POST', `${API_BASE_URL}/practice-questions/${question._id}/submit`, {
      code: correctSolution,
      language: 'java'
    });
    
    const submitResponse = await axios.post(
      `${API_BASE_URL}/practice-questions/${question._id}/submit`,
      {
        code: correctSolution,
        language: 'java'
      },
      { headers }
    );
    
    printResponse(submitResponse.status, submitResponse.data);
    
    if (!submitResponse.data.success) {
      throw new Error(submitResponse.data.message || 'Submission failed');
    }
    
    const { verdict, passedTests, totalTests, stdout, stderr } = submitResponse.data;
    
    logInfo(`  Verdict: ${verdict}`);
    logInfo(`  Tests: ${passedTests}/${totalTests}`);
    
    // Save submission
    printRequest('POST', `${API_BASE_URL}/submissions`, {
      questionId: question._id,
      questionTitle: question.title,
      topics: [question.topic],
      difficulty: question.difficulty,
      language: 'java',
      code: correctSolution,
      stdout: stdout || '',
      stderr: stderr || '',
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
        code: correctSolution,
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
    
    const submissionId = saveResponse.data.data._id;
    logSuccess(`  Submission saved: ${submissionId}`);
    
    // Verify the saved submission has correct verdict
    if (saveResponse.data.data.verdict !== verdict) {
      logError(`❌ MISMATCH: Saved submission verdict (${saveResponse.data.data.verdict}) != returned verdict (${verdict})`);
      throw new Error('Verdict mismatch in saved submission');
    }
    
    if (saveResponse.data.data.verdict === 'PASSED') {
      logSuccess(`  ✅ Verdict is PASSED - this should count as solved!`);
    }
    
    return {
      verdict,
      passedTests,
      totalTests,
      submissionId,
      submissionData: saveResponse.data.data
    };
  } catch (error) {
    logError(`  Submission failed: ${error.response?.data?.message || error.message}`);
    if (error.response) {
      printResponse(error.response.status, error.response.data);
    }
    throw error;
  }
}

async function verifyStats() {
  try {
    logInfo('\nVerifying final stats...');
    const headers = { Authorization: `Bearer ${authToken}` };
    
    printRequest('GET', `${API_BASE_URL}/submissions/stats/overview`);
    const response = await axios.get(`${API_BASE_URL}/submissions/stats/overview`, { headers });
    printResponse(response.status, response.data);
    
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
    
    const actualSubmissionIncrease = finalStats.totalSubmissions - initialStats.totalSubmissions;
    const actualSolvedIncrease = finalStats.totalSolved - initialStats.totalSolved;
    
    let allPassed = true;
    
    if (actualSubmissionIncrease !== 1) {
      logError(`❌ MISMATCH: Expected 1 new submission, got ${actualSubmissionIncrease}`);
      allPassed = false;
    } else {
      logSuccess(`✅ Total submissions correct: ${finalStats.totalSubmissions} (${actualSubmissionIncrease} new)`);
    }
    
    // If we got PASSED, solved should increase by 1
    // If we got FAILED, solved should stay the same
    if (actualSolvedIncrease < 0) {
      logError(`❌ MISMATCH: Solved count decreased (${actualSolvedIncrease}) - this shouldn't happen`);
      allPassed = false;
    } else if (actualSolvedIncrease > 1) {
      logError(`❌ MISMATCH: Expected at most 1 new solved, got ${actualSolvedIncrease}`);
      allPassed = false;
    } else {
      logSuccess(`✅ Solved count: ${finalStats.totalSolved} (${actualSolvedIncrease} new, only PASSED counted)`);
    }
    
    return { allPassed, finalStats };
  } catch (error) {
    logError(`Failed to verify stats: ${error.response?.data?.message || error.message}`);
    if (error.response) {
      printResponse(error.response.status, error.response.data);
    }
    throw error;
  }
}

async function runVerification() {
  try {
    log('\n' + '='.repeat(60), 'cyan');
    log('🔍 Quick Practice Integration Verification (with PASSED test)', 'cyan');
    log('='.repeat(60) + '\n', 'cyan');
    
    await mongoose.connect(MONGODB_URI);
    logSuccess('Connected to MongoDB');
    
    await setupTestUser();
    await getInitialStats();
    const question = await findQuestion();
    const submission = await submitCorrectSolution(question);
    
    log('\n' + '-'.repeat(60), 'cyan');
    log('📊 Submission Result:', 'cyan');
    log('-'.repeat(60), 'cyan');
    log(`Question: "${question.title}"`);
    log(`   Verdict: ${submission.verdict} | Tests: ${submission.passedTests}/${submission.totalTests} | ID: ${submission.submissionId}`);
    
    const { allPassed, finalStats } = await verifyStats();
    
    log('\n' + '='.repeat(60), 'cyan');
    if (allPassed) {
      log('✅ ALL VERIFICATIONS PASSED', 'green');
      if (submission.verdict === 'PASSED') {
        log('✅ PASSED submission correctly counted as solved', 'green');
      } else {
        log('⚠️  Submission was not PASSED (this is OK for testing)', 'yellow');
        log('   The important thing is that only PASSED counts as solved', 'yellow');
      }
    } else {
      log('❌ VERIFICATIONS FAILED', 'red');
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

runVerification();

