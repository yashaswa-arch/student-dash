import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader2, Code2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../api/axios';
import type { RootState } from '../store';
import { practiceSubmissionAPI } from '../api/services';

type Language = 'java' | 'cpp' | 'python' | 'javascript';

interface ExecutionResult {
  stdout: string;
  stderr: string;
  status: 'success' | 'error';
}

interface StarterCode {
  java?: string;
  cpp?: string;
  python?: string;
  javascript?: string;
}

interface PracticeQuestion {
  _id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  sampleInput: string;
  sampleOutput: string;
  constraints: string;
  order: number;
  starterCode: StarterCode;
}

const LANGUAGE_TEMPLATES: Record<Language, string> = {
  java: `public class Main {
    public static void main(String[] args) {
        // write your code here
    }
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // write your code here
    return 0;
}`,
  python: `def solve():
    # write your code here
    pass

if __name__ == "__main__":
    solve()`,
  javascript: `function solve() {
  // write your code here
}

solve();`
};

const QuickPracticePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [language, setLanguage] = useState<Language>('java');
  const [code, setCode] = useState<string>(LANGUAGE_TEMPLATES.java);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stdin, setStdin] = useState<string>('');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const originalConsoleLogRef = useRef<typeof console.log | null>(null);
  const [practiceStartTime, setPracticeStartTime] = useState<Date | null>(null);

  // Track when user starts practicing current question
  useEffect(() => {
    setPracticeStartTime(new Date());
  }, []);

  const goToQuestionByOffset = (offset: number) => {
    if (!selectedQuestion || questions.length === 0) return;
    const currentIndex = questions.findIndex((q) => q._id === selectedQuestion._id);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + offset;
    if (nextIndex < 0 || nextIndex >= questions.length) return;

    setSelectedQuestion(questions[nextIndex]);
    setPracticeStartTime(new Date());
  };

  const handlePrevQuestion = () => goToQuestionByOffset(-1);
  const handleNextQuestion = () => goToQuestionByOffset(1);

  // Fetch Array practice questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        setQuestionError(null);
        const response = await api.get('/practice-questions', {
          params: { topic: 'Arrays' }
        });

        const data = response.data?.data as PracticeQuestion[];
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          setSelectedQuestion(data[0]);
          setPracticeStartTime(new Date());
        } else {
          setQuestions([]);
        }
      } catch (error: any) {
        console.error('Error fetching practice questions:', error);
        setQuestionError(
          error.response?.data?.message || 'Failed to load practice questions'
        );
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  // Update code when language or selected question changes
  useEffect(() => {
    if (selectedQuestion && selectedQuestion.starterCode) {
      const starter = selectedQuestion.starterCode[language];
      setCode(starter && starter.trim().length > 0 ? starter : LANGUAGE_TEMPLATES[language]);
    } else {
      setCode(LANGUAGE_TEMPLATES[language]);
    }
    setOutput(null);
  }, [language, selectedQuestion]);

  const autoSaveSubmission = async (result: ExecutionResult) => {
    if (!user || !user._id) return;
    if (!selectedQuestion) return;
    if (result.status !== 'success') return;

    // Derive topics and time taken from question + timer
    const mainTopic = (selectedQuestion.topic || '').trim() || 'Arrays';
    const topics = [mainTopic];

    let timeTakenInMinutes: number | undefined;
    if (practiceStartTime) {
      const diffMs = Date.now() - practiceStartTime.getTime();
      const minutes = Math.max(1, Math.round(diffMs / 60000));
      if (Number.isFinite(minutes)) {
        timeTakenInMinutes = minutes;
      }
    }

    try {
      await practiceSubmissionAPI.create({
        userId: user._id,
        questionId: selectedQuestion._id,
        questionTitle: selectedQuestion.title,
        topics,
        difficulty: selectedQuestion.difficulty,
        language,
        code,
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status,
        timeTakenInMinutes,
        source: 'quick-practice'
      });
      toast.success('Saved to Question Tracker');
    } catch (error: any) {
      console.error('Error saving practice submission:', error);
      toast.error(error.response?.data?.message || 'Could not save to Question Tracker');
    }
  };

  // Execute JavaScript client-side
  const executeJavaScript = (userCode: string): ExecutionResult => {
    const logs: string[] = [];

    // Save original console.log
    originalConsoleLogRef.current = console.log;

    // Override console.log to capture output
    console.log = (...args: any[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');
      logs.push(message);
      // Also call original console.log for debugging
      if (originalConsoleLogRef.current) {
        originalConsoleLogRef.current(...args);
      }
    };

    try {
      // Execute code in a safe context
      const wrappedCode = `
        (function() {
          ${userCode}
        })();
      `;

      // eslint-disable-next-line no-new-func
      new Function(wrappedCode)();

      return {
        stdout: logs.join('\n') || 'Code executed successfully (no output)',
        stderr: '',
        status: 'success'
      };
    } catch (error) {
      return {
        stdout: logs.join('\n'),
        stderr: error instanceof Error ? error.message : String(error),
        status: 'error'
      };
    } finally {
      // Always restore console.log
      if (originalConsoleLogRef.current) {
        console.log = originalConsoleLogRef.current;
      }
    }
  };

  // Execute code via backend API
  const executeCode = async () => {
    if (!code.trim()) {
      setOutput({
        stdout: '',
        stderr: 'Please write some code before running',
        status: 'error'
      });
      return;
    }

    setIsRunning(true);
    setOutput(null);

    try {
      // JavaScript runs client-side
      if (language === 'javascript') {
        const result = executeJavaScript(code);
        setOutput(result);
        if (result.status === 'success') {
          await autoSaveSubmission(result);
        }
        setIsRunning(false);
        return;
      }

      // Other languages use backend API
      const response = await api.post('/execute', {
        language,
        code,
        stdin: stdin.trim()
      });

      if (response.data.success) {
        const result = response.data.data;
        const executionResult: ExecutionResult = {
          stdout: result.stdout || result.runtimeOutput || '',
          stderr: result.stderr || result.compilationOutput || result.runtimeOutput || '',
          status: result.status === 'accepted' || result.status === 'success' ? 'success' : 'error'
        };
        setOutput(executionResult);
        if (executionResult.status === 'success') {
          await autoSaveSubmission(executionResult);
        }
      } else {
        setOutput({
          stdout: '',
          stderr: response.data.message || 'Execution failed',
          status: 'error'
        });
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      setOutput({
        stdout: '',
        stderr: error.response?.data?.message || error.message || 'Failed to execute code',
        status: 'error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quick Practice
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>

              {/* Run Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={executeCode}
                disabled={isRunning}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Run Code</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Question Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select a Question
              </h2>
              {isLoadingQuestions && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  Loading questions...
                </div>
              )}
              {questionError && !isLoadingQuestions && (
                <div className="text-center py-8 text-red-500 text-sm">
                  {questionError}
                </div>
              )}
              {!isLoadingQuestions && !questionError && questions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No practice questions found.
                </div>
              )}
              {!isLoadingQuestions && !questionError && questions.length > 0 && (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {questions.map((q) => {
                    const isActive = selectedQuestion?._id === q._id;
                    return (
                      <button
                        key={q._id}
                        onClick={() => {
                          setSelectedQuestion(q);
                          setPracticeStartTime(new Date());
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-100'
                            : 'border-gray-200 dark:border-dark-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {q.order}. {q.title}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              q.difficulty === 'Easy'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : q.difficulty === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {q.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Editor and Output */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Details */}
            {selectedQuestion && (
              <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedQuestion.order}. {selectedQuestion.title}
                    </h2>
                    <span
                      className={`inline-block mt-1 text-xs px-3 py-1 rounded-full ${
                        selectedQuestion.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : selectedQuestion.difficulty === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={
                        !questions.length ||
                        questions.findIndex((q) => q._id === selectedQuestion._id) === 0
                      }
                      className="px-3 py-1 text-xs rounded-md border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={
                        !questions.length ||
                        questions.findIndex((q) => q._id === selectedQuestion._id) ===
                          questions.length - 1
                      }
                      className="px-3 py-1 text-xs rounded-md border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedQuestion.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Sample Input
                    </div>
                    <pre className="bg-gray-50 dark:bg-dark-900 rounded-md p-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {selectedQuestion.sampleInput}
                    </pre>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Sample Output
                    </div>
                    <pre className="bg-gray-50 dark:bg-dark-900 rounded-md p-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {selectedQuestion.sampleOutput}
                    </pre>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Constraints
                  </div>
                  <pre className="bg-gray-50 dark:bg-dark-900 rounded-md p-2 text-gray-800 dark:text-gray-200 text-xs whitespace-pre-wrap break-words">
                    {selectedQuestion.constraints}
                  </pre>
                </div>
              </div>
            )}

            {/* Code Editor */}
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-dark-700 px-4 py-2 border-b border-gray-200 dark:border-dark-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code Editor
                </span>
              </div>
              <div className="h-[400px]">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on'
                  }}
                />
              </div>
            </div>

            {/* Input (Optional) */}
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-dark-700 px-4 py-2 border-b border-gray-200 dark:border-dark-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Standard Input (Optional)
                </span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input here (if needed)..."
                className="w-full h-24 p-4 bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono text-sm border-0 focus:outline-none resize-none"
              />
            </div>

            {/* Output Panel */}
            <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-dark-700 px-4 py-2 border-b border-gray-200 dark:border-dark-600 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Output
                </span>
                {output && (
                  <div className="flex items-center space-x-2">
                    {output.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        output.status === 'success'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {output.status === 'success' ? 'Success' : 'Error'}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                {!output ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No output yet. Write code and click Run.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Stdout */}
                    {output.stdout && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Output:
                        </div>
                        <pre className="bg-gray-50 dark:bg-dark-700 p-3 rounded text-sm text-gray-900 dark:text-gray-100 font-mono whitespace-pre-wrap break-words">
                          {output.stdout}
                        </pre>
                      </div>
                    )}

                    {/* Stderr */}
                    {output.stderr && (
                      <div>
                        <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                          Error:
                        </div>
                        <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm text-red-900 dark:text-red-200 font-mono whitespace-pre-wrap break-words">
                          {output.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPracticePage;
