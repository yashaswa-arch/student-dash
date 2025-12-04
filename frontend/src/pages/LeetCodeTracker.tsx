import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Link as LinkIcon,
  Code,
  Send,
  Save,
  StickyNote,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Lightbulb,
  List
} from 'lucide-react';

interface AIFeedback {
  timeComplexity: string;
  spaceComplexity: string;
  mistakes: string[];
  missingEdgeCases: string[];
  improvements: string[];
  bruteToOptimalSuggestions: string[];
  hint: string;
}

interface Question {
  _id?: string;
  title: string;
  problemUrl: string;
  difficulty: string;
  description: string;
  userCode: string;
  language: string;
  aiFeedback?: AIFeedback;
  userNotes: string;
  status: string;
}

const LeetCodeTracker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [problem, setProblem] = useState<Question | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Attempted');
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    fetchSavedQuestions();
  }, []);

  const fetchSavedQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leetcode/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching saved questions:', error);
    }
  };

  const handleFetchProblem = async () => {
    if (!url.trim()) {
      alert('Please enter a LeetCode URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/leetcode/fetch',
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const problemData = response.data.problem;
      setProblem(problemData);
      setCode('');
      setNotes('');
      setFeedback(null);
      setStatus('Attempted');
      alert(`✅ Fetched: ${problemData.title}`);
    } catch (error: any) {
      console.error('Fetch error:', error);
      alert(error.response?.data?.message || 'Failed to fetch problem. Check URL or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/leetcode/analyze',
        {
          code,
          language,
          problemTitle: problem?.title || 'Unknown',
          problemDescription: problem?.description || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze code. AI service may be offline.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!problem) {
      alert('Please fetch a problem first!');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/leetcode/save',
        {
          title: problem.title,
          problemUrl: problem.problemUrl,
          difficulty: problem.difficulty,
          description: problem.description,
          userCode: code,
          language,
          aiFeedback: feedback,
          userNotes: notes,
          status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Question saved successfully!');
      fetchSavedQuestions();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const loadSavedQuestion = (q: Question) => {
    setProblem(q);
    setCode(q.userCode);
    setLanguage(q.language);
    setNotes(q.userNotes);
    setStatus(q.status);
    setFeedback(q.aiFeedback || null);
    setShowSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Easy: 'text-green-600 bg-green-100',
      Medium: 'text-yellow-600 bg-yellow-100',
      Hard: 'text-red-600 bg-red-100'
    };
    return colors[difficulty as keyof typeof colors] || colors.Medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Attempted': 'text-blue-600 bg-blue-100',
      'Solved Optimal': 'text-green-600 bg-green-100',
      'Needs Improvement': 'text-orange-600 bg-orange-100'
    };
    return colors[status as keyof typeof colors] || colors.Attempted;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            LeetCode Question Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Paste LeetCode URL → Auto-fetch problem → Write code → Get AI feedback
          </p>
        </motion.div>

        {/* Toggle View */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowSaved(false)}
            className={`px-4 py-2 rounded-lg font-medium ${
              !showSaved
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            New Problem
          </button>
          <button
            onClick={() => setShowSaved(true)}
            className={`px-4 py-2 rounded-lg font-medium ${
              showSaved
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <List className="w-4 h-4 inline mr-2" />
            Saved Questions ({savedQuestions.length})
          </button>
        </div>

        {!showSaved ? (
          <div className="space-y-6">
            {/* URL Input */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-purple-600" />
                Step 1: Paste LeetCode URL
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/two-sum/"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleFetchProblem}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Fetching...' : 'Fetch Problem'}
                </button>
              </div>
            </motion.div>

            {/* Problem Display */}
            {problem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {problem.title}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <a
                  href={problem.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline mb-4 inline-block"
                >
                  View on LeetCode →
                </a>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Code Editor */}
            {problem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-purple-600" />
                  Step 2: Write Your Solution
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                <button
                  onClick={handleAnalyzeCode}
                  disabled={analyzing}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {analyzing ? (
                    <>
                      <Clock className="w-4 h-4 inline mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 inline mr-2" />
                      Analyze Code
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* AI Feedback */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  AI Analysis & Feedback
                </h2>

                {/* Complexity */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                      Time Complexity
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {feedback.timeComplexity}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                      Space Complexity
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {feedback.spaceComplexity}
                    </div>
                  </div>
                </div>

                {/* Mistakes */}
                {feedback.mistakes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Mistakes / Issues Found
                    </h3>
                    <ul className="space-y-2">
                      {feedback.mistakes.map((mistake, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span className="text-gray-700 dark:text-gray-300">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Edge Cases */}
                {feedback.missingEdgeCases.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Missing Edge Cases
                    </h3>
                    <ul className="space-y-2">
                      {feedback.missingEdgeCases.map((edge, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span className="text-gray-700 dark:text-gray-300">{edge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {feedback.improvements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      How to Improve
                    </h3>
                    <ul className="space-y-2">
                      {feedback.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Brute to Optimal */}
                {feedback.bruteToOptimalSuggestions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      From Brute Force → Optimal
                    </h3>
                    <ul className="space-y-2">
                      {feedback.bruteToOptimalSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-500 mr-2">{i + 1}.</span>
                          <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hint */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint (No spoilers!)
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{feedback.hint}</p>
                </div>
              </motion.div>
            )}

            {/* Notes & Save */}
            {problem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <StickyNote className="w-5 h-5 mr-2 text-purple-600" />
                  Notes & Status
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Write your thoughts, approach, learnings..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Attempted">Attempted</option>
                      <option value="Solved Optimal">Solved Optimal</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                  >
                    {saving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="w-4 h-4 inline mr-2" />
                        Save Question
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Saved Questions List */
          <div className="grid gap-4">
            {savedQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No saved questions yet. Start by fetching a problem!
              </div>
            ) : (
              savedQuestions.map((q) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => loadSavedQuestion(q)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {q.title}
                    </h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(q.status)}`}>
                        {q.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {q.language.toUpperCase()}
                  </p>
                  {q.aiFeedback && (
                    <div className="flex gap-4 text-sm">
                      <span className="text-purple-600 dark:text-purple-400">
                        Time: {q.aiFeedback.timeComplexity}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Space: {q.aiFeedback.spaceComplexity}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeetCodeTracker;
