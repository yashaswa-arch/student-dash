import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { motion } from 'framer-motion'
import axios from 'axios'
import Editor from '@monaco-editor/react'
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
  Send,
  History
} from 'lucide-react'
import MentorFeedbackPanel from '../components/MentorFeedbackPanel'
import SubmissionHistory from '../components/SubmissionHistory'

interface Question {
  _id: string
  title: string
  description: string
  platform: string
  platformUrl?: string
  difficulty: string
  optimalApproach?: string
  optimalComplexity?: {
    time: string
    space: string
  }
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

interface MentorAnalysis {
  analysisSummary: string
  approachDetected: string
  correctness: boolean
  timeComplexity: string
  spaceComplexity: string
  strengths: string[]
  weaknesses: string[]
  improvementSuggestions: string[]
  nextProblemRecommendation: {
    topic: string
    why: string
  }
  mindsetCoaching: string
}

const QuestionDetailPageNew: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'problem' | 'submissions'>('problem')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [submitting, setSubmitting] = useState(false)
  const [mentorFeedback, setMentorFeedback] = useState<MentorAnalysis | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const languageTemplates: Record<string, string> = {
    javascript: `function solution(input) {\n  // Write your code here\n  \n  return result;\n}`,
    python: `def solution(input):\n    # Write your code here\n    \n    return result`,
    java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`
  }

  useEffect(() => {
    fetchQuestion()
    loadDraftCode()
  }, [id])

  useEffect(() => {
    saveDraftCode()
  }, [code, language])

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

  const loadDraftCode = () => {
    const draft = localStorage.getItem(`question_${id}_draft`)
    const savedLang = localStorage.getItem(`question_${id}_language`)
    if (draft) setCode(draft)
    if (savedLang) setLanguage(savedLang)
    else setCode(languageTemplates[language])
  }

  const saveDraftCode = () => {
    localStorage.setItem(`question_${id}_draft`, code)
    localStorage.setItem(`question_${id}_language`, language)
  }

  const handleLanguageChange = (newLang: string) => {
    if (!code || code === languageTemplates[language]) {
      setCode(languageTemplates[newLang])
    }
    setLanguage(newLang)
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `http://localhost:5000/api/questions/${id}/submit`,
        { code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log('Submit response:', response.data)
      
      // The backend returns aiAnalysis inside submission object
      const aiAnalysis = response.data.submission?.aiAnalysis
      if (aiAnalysis) {
        setMentorFeedback(aiAnalysis)
        setShowFeedback(true)
      } else {
        console.warn('No AI analysis in response')
        alert('Submission successful, but mentor feedback is not available')
      }
      
      fetchQuestion() // Refresh to update status
    } catch (error: any) {
      console.error('Error submitting code:', error)
      alert(error.response?.data?.message || 'Failed to submit code')
    } finally {
      setSubmitting(false)
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
      todo: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
      attempted: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      solved: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
    }
    return colors[status as keyof typeof colors] || colors.todo
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Question not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/questions')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Questions</span>
            </button>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Star className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Edit2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('problem')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'problem'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Code2 className="w-4 h-4 inline mr-2" />
              Problem & Solution
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submissions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Submission History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'problem' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Problem Description */}
            <div className="space-y-6">
              {/* Title & Meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {question.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                        {question.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                        {question.platform}
                      </span>
                      {question.platformUrl && (
                        <a
                          href={question.platformUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {question.optimalComplexity && (
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Expected Optimal Solution</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-purple-700 dark:text-purple-300">Time: {question.optimalComplexity.time}</span>
                      <span className="text-purple-700 dark:text-purple-300">Space: {question.optimalComplexity.space}</span>
                      {question.optimalApproach && (
                        <span className="text-purple-700 dark:text-purple-300">Approach: {question.optimalApproach}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 text-sm">
                    {question.description}
                  </div>
                </div>

                {question.examples && question.examples.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Examples</h3>
                    {question.examples.map((example, idx) => (
                      <div key={idx} className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Example {idx + 1}:</p>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Input:</span> <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{example.input}</code></p>
                          <p><span className="font-medium">Output:</span> <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{example.output}</code></p>
                          {example.explanation && (
                            <p className="text-gray-600 dark:text-gray-400">{example.explanation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {question.constraints && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Constraints</h3>
                    <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {question.constraints}
                    </pre>
                  </div>
                )}

                {question.hints && question.hints.length > 0 && (
                  <div className="mt-6">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        💡 Hints ({question.hints.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {question.hints.map((hint, idx) => (
                          <div key={idx} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-gray-600 dark:text-gray-400">
                            {idx + 1}. {hint}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Code Editor & Feedback */}
            <div className="space-y-6">
              {/* Code Editor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Solution</h3>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>

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
                    automaticLayout: true,
                  }}
                />

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Get Mentor Review
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Mentor Feedback */}
              {showFeedback && mentorFeedback && (
                <MentorFeedbackPanel feedback={mentorFeedback} />
              )}
            </div>
          </div>
        ) : (
          <SubmissionHistory questionId={id!} />
        )}
      </div>
    </div>
  )
}

export default QuestionDetailPageNew
