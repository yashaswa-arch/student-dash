/**
 * Local Code Execution Service for testing without Judge0 CE
 * This is a fallback/mock service for development
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class LocalCodeExecutionService {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'skill-analytics-platform-code');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create temp directory:', error.message);
    }
  }

  /**
   * Execute code locally (limited language support)
   */
  async submitCode({ code, language, input = '', expectedOutput = '', testCases = [] }) {
    try {
      // Use test cases or create default
      const cases = testCases.length > 0 ? testCases : [{ input, expectedOutput }];
      
      let results = [];
      
      for (const testCase of cases) {
        const result = await this.executeCode(code, language, testCase.input);
        results.push({
          testCase: {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput
          },
          actualOutput: result.output,
          passed: this.compareOutputs(result.output, testCase.expectedOutput),
          executionTime: result.executionTime,
          memoryUsage: 0, // Not available in local execution
          status: result.error ? 'runtime_error' : 'accepted',
          errorMessage: result.error
        });
      }

      const passedTests = results.filter(r => r.passed).length;
      const overallStatus = results.some(r => r.status === 'runtime_error') ? 'runtime_error' : 
                           passedTests === results.length ? 'accepted' : 'wrong_answer';

      return {
        status: overallStatus,
        score: Math.round((passedTests / results.length) * 100),
        executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
        memoryUsage: 0,
        testResults: results,
        totalTests: results.length,
        passedTests,
        compilationOutput: null,
        runtimeOutput: results.find(r => r.errorMessage)?.errorMessage || null
      };

    } catch (error) {
      console.error('Local execution error:', error);
      return {
        status: 'internal_error',
        score: 0,
        executionTime: 0,
        memoryUsage: 0,
        testResults: [],
        totalTests: 0,
        passedTests: 0,
        compilationOutput: null,
        runtimeOutput: error.message
      };
    }
  }

  async executeCode(code, language, input) {
    const startTime = Date.now();
    
    try {
      switch (language.toLowerCase()) {
        case 'javascript':
          return await this.executeJavaScript(code, input);
        case 'python':
          return await this.executePython(code, input);
        default:
          throw new Error(`Local execution not supported for ${language}`);
      }
    } catch (error) {
      return {
        output: '',
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  async executeJavaScript(code, input) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Wrap code to handle input
      const wrappedCode = `
        const originalConsoleLog = console.log;
        const outputs = [];
        console.log = (...args) => {
          outputs.push(args.join(' '));
        };
        
        // Mock input function for Node.js
        const mockInput = () => '${input.replace(/'/g, "\\'")}';
        
        try {
          ${code}
          process.stdout.write(outputs.join('\\n'));
        } catch (error) {
          process.stderr.write(error.message);
          process.exit(1);
        }
      `;

      const child = spawn('node', ['-e', wrappedCode], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          output: output.trim(),
          error: error || null,
          executionTime: Date.now() - startTime
        });
      });

      // Send input to process
      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();

      // Timeout after 5 seconds
      setTimeout(() => {
        child.kill();
        resolve({
          output: '',
          error: 'Time limit exceeded',
          executionTime: 5000
        });
      }, 5000);
    });
  }

  async executePython(code, input) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const child = spawn('python', ['-c', code], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          output: output.trim(),
          error: error || null,
          executionTime: Date.now() - startTime
        });
      });

      // Send input to process
      if (input) {
        child.stdin.write(input + '\n');
      }
      child.stdin.end();

      // Timeout after 5 seconds
      setTimeout(() => {
        child.kill();
        resolve({
          output: '',
          error: 'Time limit exceeded',
          executionTime: 5000
        });
      }, 5000);
    });
  }

  compareOutputs(actual, expected) {
    if (!expected) return true;
    
    const normalizeOutput = (str) => str.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  getSupportedLanguages() {
    return ['javascript', 'python'];
  }

  getLanguageInfo(language) {
    const languageDetails = {
      javascript: { name: 'JavaScript', version: 'Node.js (Local)', extension: '.js' },
      python: { name: 'Python', version: 'Python 3 (Local)', extension: '.py' }
    };

    return {
      id: language.toLowerCase(),
      key: language.toLowerCase(),
      ...languageDetails[language.toLowerCase()]
    };
  }
}

module.exports = new LocalCodeExecutionService();