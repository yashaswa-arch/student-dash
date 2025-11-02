import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Brain, BookOpen, AlertCircle, Code2, Lightbulb, Target, CheckCircle } from 'lucide-react';
import { aiAPI } from '../api/services';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
}

interface AnalysisResult {
  analysis_id?: string;
  quality_score: number;
  issues: Array<{
    category: string;
    severity: string;
    line?: number;
    line_number?: number;
    column?: number;
    message: string;
    detailed_explanation?: string;
    suggestion?: string;
    example_fix?: string;
    confidence?: number;
    tags?: string[];
  }>;
  suggestions: Array<{
    title: string;
    description: string;
    suggestion_type: string;
    before_code?: string;
    after_code?: string;
    impact?: string;
  }>;
  learning_recommendations: Array<{
    topic: string;
    description: string;
    resource_type: string;
    priority: number;
    estimated_time?: string;
  }>;
  metrics: {
    lines_of_code: number;
    complexity_score?: number;
    maintainability_index?: number;
    functions_count?: number;
    classes_count?: number;
  };
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode = '', 
  language: initialLanguage = 'javascript',
  onCodeChange 
}) => {
  // Function to get example code for each language
  const getLanguageTemplate = (lang: string): string => {
    const templates: { [key: string]: string } = {
      javascript: `// JavaScript example - try adding some errors to test analysis
function greet(name) {
    console.log("Hello, " + name);
}

greet("World");`,
      python: `# Python example - try adding some errors to test analysis
def greet(name):
    print(f"Hello, {name}")

greet("World")`,
      java: `// Java example - try adding some errors to test analysis
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      cpp: `// C++ example - try adding some errors to test analysis
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
      c: `// C example - try adding some errors to test analysis
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      csharp: `// C# example - try adding some errors to test analysis
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
      go: `// Go example - try adding some errors to test analysis
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
      rust: `// Rust example - try adding some errors to test analysis
fn main() {
    println!("Hello, World!");
}`,
      php: `<?php
// PHP example - try adding some errors to test analysis
echo "Hello, World!";
?>`,
      ruby: `# Ruby example - try adding some errors to test analysis
puts "Hello, World!"`,
      swift: `// Swift example - try adding some errors to test analysis
print("Hello, World!")`,
      kotlin: `// Kotlin example - try adding some errors to test analysis
fun main() {
    println("Hello, World!")
}`,
      typescript: `// TypeScript example - try adding some errors to test analysis
function greet(name: string): void {
    console.log(\`Hello, \${name}!\`);
}

greet("World");`,
      dart: `// Dart example - try adding some errors to test analysis
void main() {
    print('Hello, World!');
}`,
      scala: `// Scala example - try adding some errors to test analysis
object HelloWorld extends App {
    println("Hello, World!")
}`
    };
    
    return templates[lang] || `// ${lang.toUpperCase()} example\n// Write your code here...`;
  };

  const [code, setCode] = useState(initialCode || getLanguageTemplate(initialLanguage));
  const [language, setLanguage] = useState(initialLanguage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'analysis' | 'recommendations'>('editor');

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    
    // If code is empty or still has the old template, update to new language template
    if (!code.trim() || code === getLanguageTemplate(language)) {
      const newTemplate = getLanguageTemplate(newLanguage);
      setCode(newTemplate);
      onCodeChange?.(newTemplate);
    }
    
    // Clear previous analysis when language changes
    setAnalysis(null);
    setActiveTab('editor');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      alert('Please enter some code to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    console.log('🔍 Starting analysis for:', { 
      language, 
      codeLength: code.length,
      codePreview: code.substring(0, 100) + '...'
    });
    
    try {
      const result = await aiAPI.analyzeCode({
        code,
        language,
        include_suggestions: true,
        include_recommendations: true
      });
      
      console.log('📊 Analysis result received:', result);
      
      // Handle the response from the new intelligent AI service
      if (result.success && result.data) {
        console.log('✅ Setting analysis data:', {
          quality_score: result.data.quality_score,
          issues_count: result.data.issues?.length || 0,
          suggestions_count: result.data.suggestions?.length || 0,
          recommendations_count: result.data.learning_recommendations?.length || 0
        });
        setAnalysis(result.data);
        setActiveTab('analysis');
        
        // No popup - just switch to analysis tab to show detailed results
        console.log('Analysis complete, switched to analysis tab');
      } else {
        console.error('❌ Analysis failed:', result.message || 'Unknown error');
        alert(`Analysis failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Code analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      alert(`Analysis error: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': 
      case 'critical': 
        return 'text-red-500';
      case 'medium': 
        return 'text-yellow-500';
      default: 
        return 'text-blue-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': 
      case 'critical': 
        return <AlertCircle className="w-4 h-4" />;
      default: 
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Code2 className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">AI Code Editor</h1>
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 px-3 py-1 rounded border border-gray-600 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="dart">Dart</option>
            <option value="scala">Scala</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          {analysis && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Quality Score:</span>
              <span className={`font-bold ${getQualityColor(analysis.quality_score)}`}>
                {analysis.quality_score.toFixed(1)}/10
              </span>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={analyzeCode}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Code'}</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex">
        {['editor', 'analysis', 'recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400 bg-gray-750'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            {tab}
            {tab === 'analysis' && analysis?.issues.length ? (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {analysis.issues.length}
              </span>
            ) : null}
            {tab === 'recommendations' && analysis?.learning_recommendations.length ? (
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {analysis.learning_recommendations.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder={`Write your ${language} code here...`}
                className="w-full h-full bg-gray-800 text-white font-mono p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
              />
            </div>
            
            {code && (
              <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Lines: {code.split('\\n').length}</span>
                  <span>Characters: {code.length}</span>
                </div>
                
                <button
                  onClick={analyzeCode}
                  disabled={isAnalyzing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium flex items-center space-x-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Analysis</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="flex-1 p-6 overflow-y-auto">
            {analysis ? (
              <div className="space-y-6">
                {/* Quality Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Code Quality Overview</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getQualityColor(analysis.quality_score)}`}>
                        {analysis.quality_score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-400">Quality Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {analysis.metrics.complexity_score || 0}
                      </div>
                      <div className="text-sm text-gray-400">Complexity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-300">
                        {analysis.metrics.lines_of_code}
                      </div>
                      <div className="text-sm text-gray-400">Lines of Code</div>
                    </div>
                  </div>
                </motion.div>

                {/* Issues */}
                {analysis.issues.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span>Issues Found ({analysis.issues.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {analysis.issues.map((issue, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className={getSeverityColor(issue.severity)}>
                              {getSeverityIcon(issue.severity)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-white">{issue.message}</span>
                                {(issue.line_number || issue.line) && (
                                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                                    Line {issue.line_number || issue.line}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                  issue.severity === 'critical' ? 'bg-red-900 text-red-200' :
                                  issue.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                                  issue.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                                  'bg-blue-900 text-blue-200'
                                }`}>
                                  {issue.severity}
                                </span>
                              </div>
                              
                              {issue.detailed_explanation && (
                                <p className="text-sm text-gray-300 mb-2">
                                  <span className="font-medium">Why this matters:</span> {issue.detailed_explanation}
                                </p>
                              )}
                              
                              {issue.suggestion && (
                                <p className="text-sm text-blue-300 mb-2">
                                  <span className="font-medium">💡 How to fix:</span> {issue.suggestion}
                                </p>
                              )}
                              
                              {issue.example_fix && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-400 mb-1">✅ Correct code:</p>
                                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-300 block">
                                    {issue.example_fix}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-green-900 bg-opacity-20 border border-green-500 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Perfect Code! 🎉</span>
                    </h3>
                    <p className="text-green-300">
                      No issues found in your code. Great job! Your code follows best practices and is ready to run.
                    </p>
                  </motion.div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <span>Improvement Suggestions</span>
                    </h3>
                    <div className="space-y-3">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                              {suggestion.suggestion_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{suggestion.description}</p>
                          {suggestion.before_code && suggestion.after_code && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs text-gray-400">Before:</div>
                              <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                <code>{suggestion.before_code}</code>
                              </pre>
                              <div className="text-xs text-gray-400">After:</div>
                              <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                <code>{suggestion.after_code}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-20">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Run code analysis to see detailed insights</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="flex-1 p-6 overflow-y-auto">
            {analysis?.learning_recommendations.length ? (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <span>Personalized Learning Recommendations</span>
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Based on your code analysis, here are some resources to help you improve
                  </p>
                </motion.div>

                {analysis.learning_recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">{rec.topic}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          rec.priority === 1 ? 'bg-red-600' :
                          rec.priority === 2 ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}>
                          Priority {rec.priority}
                        </span>
                        {rec.estimated_time && (
                          <span className="px-2 py-1 bg-blue-600 rounded text-xs">
                            {rec.estimated_time}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{rec.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 capitalize">
                        📚 {rec.resource_type}
                      </span>
                      <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                        Start Learning
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Run code analysis to get personalized learning recommendations</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;