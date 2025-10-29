/**
 * Test file for Code Execution System
 * Run with: node src/tests/codeExecutionTest.js
 */

require('dotenv').config();
const connectDB = require('../config/database');
const codeExecutionService = require('../services/codeExecutionService');

async function testCodeExecution() {
  try {
    console.log('🧪 Testing Code Execution System...\n');

    // Test 1: Simple JavaScript execution
    console.log('Test 1: JavaScript Hello World');
    const jsResult = await codeExecutionService.submitCode({
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      expectedOutput: 'Hello, World!'
    });
    console.log('Result:', jsResult);
    console.log('✅ JavaScript test completed\n');

    // Test 2: Python with input/output
    console.log('Test 2: Python with input');
    const pythonResult = await codeExecutionService.submitCode({
      code: `
name = input()
print(f"Hello, {name}!")
      `,
      language: 'python',
      input: 'Alice',
      expectedOutput: 'Hello, Alice!'
    });
    console.log('Result:', pythonResult);
    console.log('✅ Python test completed\n');

    // Test 3: Java class execution
    console.log('Test 3: Java class');
    const javaResult = await codeExecutionService.submitCode({
      code: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Java is working!");
    }
}
      `,
      language: 'java',
      expectedOutput: 'Java is working!'
    });
    console.log('Result:', javaResult);
    console.log('✅ Java test completed\n');

    // Test 4: Multiple test cases
    console.log('Test 4: Multiple test cases (addition function)');
    const multiTestResult = await codeExecutionService.submitCode({
      code: `
function add(a, b) {
    return a + b;
}

// Read input and process
const input = require('fs').readFileSync(0, 'utf8').trim();
const [a, b] = input.split(' ').map(Number);
console.log(add(a, b));
      `,
      language: 'javascript',
      testCases: [
        { input: '2 3', expectedOutput: '5' },
        { input: '10 -5', expectedOutput: '5' },
        { input: '0 0', expectedOutput: '0' }
      ]
    });
    console.log('Result:', multiTestResult);
    console.log('✅ Multiple test cases completed\n');

    // Test 5: Error handling (compilation error)
    console.log('Test 5: Compilation error handling');
    const errorResult = await codeExecutionService.submitCode({
      code: 'console.log("Missing closing quote);',
      language: 'javascript'
    });
    console.log('Result:', errorResult);
    console.log('✅ Error handling test completed\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testCodeExecution();
}

module.exports = testCodeExecution;