const axios = require('axios');
const localCodeExecutionService = require('./localCodeExecutionService');

// Judge0 CE Configuration
const JUDGE0_CONFIG = {
  baseURL: process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com',
  apiKey: process.env.JUDGE0_API_KEY || '',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  },
  timeout: 30000 // 30 seconds
};

// Check if Judge0 is configured
const isJudge0Configured = () => {
  return !!(JUDGE0_CONFIG.apiKey && JUDGE0_CONFIG.apiKey !== '');
};

// Language mapping for Judge0 CE
const LANGUAGE_MAP = {
  'javascript': 63,      // Node.js
  'python': 71,          // Python 3
  'java': 62,            // Java
  'cpp': 54,             // C++ (GCC 9.2.0)
  'c': 50,               // C (GCC 9.2.0)
  'csharp': 51,          // C# (Mono 6.6.0.161)
  'php': 68,             // PHP
  'ruby': 72,            // Ruby
  'go': 60,              // Go
  'swift': 83,           // Swift
  'kotlin': 78,          // Kotlin
  'rust': 73,            // Rust
  'typescript': 74       // TypeScript
};

// Status mapping
const STATUS_MAP = {
  1: 'in_queue',
  2: 'processing',
  3: 'accepted',
  4: 'wrong_answer',
  5: 'time_limit_exceeded',
  6: 'compilation_error',
  7: 'runtime_error_sigsegv',
  8: 'runtime_error_sigxfsz',
  9: 'runtime_error_sigfpe',
  10: 'runtime_error_sigabrt',
  11: 'runtime_error_nzec',
  12: 'runtime_error_other',
  13: 'internal_error',
  14: 'exec_format_error'
};

class CodeExecutionService {
  constructor() {
    this.client = axios.create({
      baseURL: JUDGE0_CONFIG.baseURL,
      headers: JUDGE0_CONFIG.headers,
      timeout: JUDGE0_CONFIG.timeout
    });
  }

  /**
   * Submit code for execution
   * @param {Object} submission - Code submission details
   * @returns {Promise<Object>} Submission result
   */
  async submitCode({
    code,
    language,
    input = '',
    expectedOutput = '',
    timeLimit = 5, // seconds
    memoryLimit = 128000, // KB
    testCases = []
  }) {
    try {
      // Check if Judge0 is configured, otherwise use local execution
      if (!isJudge0Configured()) {
        console.log('⚠️ Judge0 not configured, using local execution');
        return await localCodeExecutionService.submitCode({
          code,
          language,
          input,
          expectedOutput,
          testCases
        });
      }

      const languageId = LANGUAGE_MAP[language.toLowerCase()];
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // If no test cases provided, create one with input/expectedOutput
      const cases = testCases.length > 0 ? testCases : [{ input, expectedOutput }];
      
      // Submit all test cases
      const submissions = await Promise.all(
        cases.map(testCase => this.submitSingleExecution({
          code,
          languageId,
          input: testCase.input,
          timeLimit,
          memoryLimit
        }))
      );

      // Wait for all executions to complete
      const results = await Promise.all(
        submissions.map(sub => this.waitForResult(sub.token))
      );

      // Process results
      return this.processResults(results, cases, expectedOutput);

    } catch (error) {
      console.error('Code execution error:', error);
      
      // If Judge0 fails, try local execution as fallback
      if (error.response || error.request) {
        console.log('🔄 Judge0 failed, falling back to local execution');
        try {
          return await localCodeExecutionService.submitCode({
            code,
            language,
            input,
            expectedOutput,
            testCases
          });
        } catch (localError) {
          console.error('Local execution also failed:', localError);
        }
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Submit single code execution
   * @private
   */
  async submitSingleExecution({ code, languageId, input, timeLimit, memoryLimit }) {
    const payload = {
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: input ? Buffer.from(input).toString('base64') : '',
      cpu_time_limit: timeLimit,
      memory_limit: memoryLimit,
      wall_time_limit: timeLimit + 2,
      max_processes_and_or_threads: 60,
      enable_per_process_and_thread_time_limit: false,
      enable_per_process_and_thread_memory_limit: false,
      max_file_size: 1024 // KB
    };

    const response = await this.client.post('/submissions', payload);
    return response.data;
  }

  /**
   * Wait for execution result with polling
   * @private
   */
  async waitForResult(token, maxAttempts = 20) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await this.client.get(`/submissions/${token}`);
        const result = response.data;

        // If execution is complete
        if (result.status.id >= 3) {
          return {
            ...result,
            stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '',
            stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '',
            compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : ''
          };
        }

        // Wait before next poll
        await this.sleep(1000);
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        await this.sleep(1000);
      }
    }

    throw new Error('Execution timeout - result not ready');
  }

  /**
   * Process execution results
   * @private
   */
  processResults(results, testCases, expectedOutput) {
    let totalPassed = 0;
    let totalExecutionTime = 0;
    let totalMemoryUsage = 0;

    const testResults = results.map((result, index) => {
      const testCase = testCases[index];
      const actualOutput = result.stdout?.trim() || '';
      const expected = testCase.expectedOutput || expectedOutput;
      const passed = this.compareOutputs(actualOutput, expected);
      
      if (passed) totalPassed++;
      
      totalExecutionTime += parseFloat(result.time) || 0;
      totalMemoryUsage += parseInt(result.memory) || 0;

      return {
        testCase: {
          input: testCase.input || '',
          expectedOutput: expected
        },
        actualOutput,
        passed,
        executionTime: parseFloat(result.time) || 0,
        memoryUsage: parseInt(result.memory) || 0,
        status: STATUS_MAP[result.status.id] || 'unknown',
        errorMessage: result.stderr || result.compile_output || null
      };
    });

    // Determine overall status
    let overallStatus = 'accepted';
    if (results.some(r => r.status.id === 6)) {
      overallStatus = 'compilation_error';
    } else if (results.some(r => r.status.id >= 7 && r.status.id <= 12)) {
      overallStatus = 'runtime_error';
    } else if (results.some(r => r.status.id === 5)) {
      overallStatus = 'time_limit_exceeded';
    } else if (totalPassed < testResults.length) {
      overallStatus = 'wrong_answer';
    }

    return {
      status: overallStatus,
      score: Math.round((totalPassed / testResults.length) * 100),
      executionTime: totalExecutionTime,
      memoryUsage: Math.round(totalMemoryUsage / results.length),
      testResults,
      totalTests: testResults.length,
      passedTests: totalPassed,
      compilationOutput: results[0]?.compile_output || null,
      runtimeOutput: results[0]?.stderr || null
    };
  }

  /**
   * Compare actual vs expected outputs
   * @private
   */
  compareOutputs(actual, expected) {
    if (!expected) return true; // No expected output means any output is acceptable
    
    // Normalize whitespace and line endings
    const normalizeOutput = (str) => str.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
    
    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    if (!isJudge0Configured()) {
      return localCodeExecutionService.getSupportedLanguages();
    }
    return Object.keys(LANGUAGE_MAP);
  }

  /**
   * Get language info
   */
  getLanguageInfo(language) {
    if (!isJudge0Configured()) {
      return localCodeExecutionService.getLanguageInfo(language);
    }
    
    const languageId = LANGUAGE_MAP[language.toLowerCase()];
    if (!languageId) return null;

    const languageDetails = {
      javascript: { name: 'JavaScript', version: 'Node.js 12.14.0', extension: '.js' },
      python: { name: 'Python', version: '3.8.1', extension: '.py' },
      java: { name: 'Java', version: 'OpenJDK 13.0.1', extension: '.java' },
      cpp: { name: 'C++', version: 'GCC 9.2.0', extension: '.cpp' },
      c: { name: 'C', version: 'GCC 9.2.0', extension: '.c' },
      csharp: { name: 'C#', version: 'Mono 6.6.0.161', extension: '.cs' },
      php: { name: 'PHP', version: '7.4.1', extension: '.php' },
      ruby: { name: 'Ruby', version: '2.7.0', extension: '.rb' },
      go: { name: 'Go', version: '1.13.5', extension: '.go' },
      swift: { name: 'Swift', version: '5.2.3', extension: '.swift' }
    };

    return {
      id: languageId,
      key: language.toLowerCase(),
      ...languageDetails[language.toLowerCase()]
    };
  }

  /**
   * Handle errors
   * @private
   */
  handleError(error) {
    if (error.response) {
      // Judge0 API error
      return {
        status: 'api_error',
        message: error.response.data?.message || 'Judge0 API error',
        code: error.response.status
      };
    } else if (error.request) {
      // Network error
      return {
        status: 'network_error',
        message: 'Unable to connect to code execution service'
      };
    } else {
      // Other error
      return {
        status: 'internal_error',
        message: error.message || 'Internal execution error'
      };
    }
  }

  /**
   * Sleep utility
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new CodeExecutionService();