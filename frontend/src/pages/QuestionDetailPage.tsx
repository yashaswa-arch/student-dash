import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { motion } from 'framer-motion'
import axios from 'axios'
import { 
  ArrowLeft, 
  ExternalLink, 
  Edit2, 
  Star,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code2,
  Play,
  Send
} from 'lucide-react'

interface Question {
  _id: string
  title: string
  description: string
  platform: string
  platformUrl?: string
  difficulty: string
  status: string
  tags: string[]
  topics: string[]
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
  examples: Array<{
    input: string
    output: string
    explanation?: string
  }>
  hints: string[]
  constraints?: string
  notes?: string
  attempts: number
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:5000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuestion(response.data)
    } catch (error) {
      console.error('Error fetching question:', error)
      alert('Failed to load question')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
      hard: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    }
    return colors[difficulty as keyof typeof colors] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors = {
      solved: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      attempted: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
      todo: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
    }
    return colors[status as keyof typeof colors] || colors.todo
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Question Not Found</h2>
          <button
            onClick={() => navigate('/questions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Questions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/questions')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>Back to Questions</span>
            </button>

            <div className="flex items-center gap-3">
              {question.platformUrl && (
                <a
                  href={question.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <ExternalLink size={20} />
                </a>
              )}
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                <Star size={20} fill={question.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <Edit2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Question Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
            >
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {question.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                  {question.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {question.platform}
                </span>
              </div>

              {/* Description */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {question.description}
                </p>
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {question.topics.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Topics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {question.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Examples */}
            {question.examples && question.examples.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Examples</h2>
                {question.examples.map((example, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Example {index + 1}:</p>
                    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Input: </span>
                        <code className="text-sm text-gray-900 dark:text-white">{example.input}</code>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Output: </span>
                        <code className="text-sm text-gray-900 dark:text-white">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Explanation: </span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Constraints */}
            {question.constraints && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Constraints</h2>
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {question.constraints}
                </pre>
              </motion.div>
            )}

            {/* Hints */}
            {question.hints && question.hints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hints</h2>
                <div className="space-y-3">
                  {question.hints.filter(h => h.trim()).map((hint, index) => (
                    <details key={index} className="group">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        Hint {index + 1}
                      </summary>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 pl-4">
                        {hint}
                      </p>
                    </details>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Personal Notes */}
            {question.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Personal Notes</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {question.notes}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column - Test Cases & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Attempts:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{question.attempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Test Cases:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{question.testCases.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`text-sm font-semibold ${getStatusColor(question.status)}`}>
                    {question.status}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Test Cases */}
            {question.testCases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Test Cases</h3>
                <div className="space-y-3">
                  {question.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                    >
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Test Case {index + 1}
                      </p>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Input: </span>
                          <code className="text-gray-900 dark:text-white">{testCase.input}</code>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Expected: </span>
                          <code className="text-gray-900 dark:text-white">{testCase.expectedOutput}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700 space-y-3"
            >
              <button
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                onClick={() => alert('Code editor coming soon!')}
              >
                <Code2 size={20} />
                Start Coding
              </button>
              <button
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                disabled
              >
                <Play size={20} />
                Run Tests
              </button>
              <button
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium"
                disabled
              >
                <Send size={20} />
                Submit Solution
              </button>
            </motion.div>

            {/* Coming Soon Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Coming Soon:</strong> Code editor, test runner, and AI analysis features are currently in development!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionDetailPage
