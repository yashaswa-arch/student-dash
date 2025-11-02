import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Code2,
  ExternalLink,
  Edit2,
  Trash2,
  Play,
  Star,
  TrendingUp,
  Calendar,
  Tag,
  ArrowLeft,
  X
} from 'lucide-react'

interface Question {
  _id: string
  title: string
  description: string
  platform: string
  platformUrl?: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'todo' | 'attempted' | 'solved'
  tags: string[]
  topics: string[]
  attempts: number
  timeSpent: number
  lastAttemptedAt?: string
  solvedAt?: string
  submissions: any[]
  isFavorite: boolean
  createdAt: string
}

interface Stats {
  total: number
  solved: number
  attempted: number
  todo: number
  easy: number
  medium: number
  hard: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
}

const QuestionTrackerPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [sortBy, setSortBy] = useState('-createdAt')

  // Add Question Form State
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    platform: 'custom' as 'leetcode' | 'codeforces' | 'hackerrank' | 'codechef' | 'custom',
    platformUrl: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: [] as string[],
    topics: [] as string[],
    testCases: [{ input: '', expectedOutput: '' }],
    examples: [{ input: '', output: '', explanation: '' }],
    hints: [''],
    constraints: '',
    notes: ''
  })
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestions()
    fetchStats()
  }, [filterStatus, filterDifficulty, filterPlatform, searchQuery, sortBy])

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty)
      if (filterPlatform !== 'all') params.append('platform', filterPlatform)
      if (searchQuery) params.append('search', searchQuery)
      params.append('sort', sortBy)

      const response = await axios.get(`http://localhost:5000/api/questions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setQuestions(response.data.questions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/questions/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchQuestions()
      fetchStats()
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  // Available topics from backend schema
  const availableTopics = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
    'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
    'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Bit Manipulation',
    'Stack', 'Design', 'Heap (Priority Queue)', 'Graph', 'Simulation',
    'Prefix Sum', 'Counting', 'Sliding Window', 'Union Find', 'Linked List'
  ]

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...newQuestion,
        // Filter out empty examples and hints
        examples: newQuestion.examples.filter(ex => ex.input || ex.output),
        hints: newQuestion.hints.filter(h => h.trim()),
        testCases: newQuestion.testCases.filter(tc => tc.input || tc.expectedOutput)
      }

      await axios.post('http://localhost:5000/api/questions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Reset form
      setNewQuestion({
        title: '',
        description: '',
        platform: 'custom',
        platformUrl: '',
        difficulty: 'medium',
        tags: [],
        topics: [],
        testCases: [{ input: '', expectedOutput: '' }],
        examples: [{ input: '', output: '', explanation: '' }],
        hints: [''],
        constraints: '',
        notes: ''
      })
      setTagInput('')
      setShowAddModal(false)
      fetchQuestions()
      fetchStats()
    } catch (error: any) {
      console.error('Error adding question:', error)
      alert(error.response?.data?.message || 'Failed to add question')
    } finally {
      setSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !newQuestion.tags.includes(tagInput.trim())) {
      setNewQuestion({ ...newQuestion, tags: [...newQuestion.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setNewQuestion({ ...newQuestion, tags: newQuestion.tags.filter(t => t !== tag) })
  }

  const toggleTopic = (topic: string) => {
    if (newQuestion.topics.includes(topic)) {
      setNewQuestion({ ...newQuestion, topics: newQuestion.topics.filter(t => t !== topic) })
    } else {
      setNewQuestion({ ...newQuestion, topics: [...newQuestion.topics, topic] })
    }
  }

  const addTestCase = () => {
    setNewQuestion({
      ...newQuestion,
      testCases: [...newQuestion.testCases, { input: '', expectedOutput: '' }]
    })
  }

  const removeTestCase = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      testCases: newQuestion.testCases.filter((_, i) => i !== index)
    })
  }

  const updateTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const updatedTestCases = [...newQuestion.testCases]
    updatedTestCases[index][field] = value
    setNewQuestion({ ...newQuestion, testCases: updatedTestCases })
  }

  const addExample = () => {
    setNewQuestion({
      ...newQuestion,
      examples: [...newQuestion.examples, { input: '', output: '', explanation: '' }]
    })
  }

  const removeExample = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      examples: newQuestion.examples.filter((_, i) => i !== index)
    })
  }

  const addHint = () => {
    setNewQuestion({ ...newQuestion, hints: [...newQuestion.hints, ''] })
  }

  const removeHint = (index: number) => {
    setNewQuestion({ ...newQuestion, hints: newQuestion.hints.filter((_, i) => i !== index) })
  }

  const updateHint = (index: number, value: string) => {
    const updatedHints = [...newQuestion.hints]
    updatedHints[index] = value
    setNewQuestion({ ...newQuestion, hints: updatedHints })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved':
        return <CheckCircle2 className="text-green-500" size={20} />
      case 'attempted':
        return <Clock className="text-orange-500" size={20} />
      default:
        return <AlertCircle className="text-gray-400" size={20} />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      solved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      attempted: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      todo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
    return styles[status as keyof typeof styles]
  }

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      easy: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      hard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    }
    return styles[difficulty as keyof typeof styles]
  }

  const getBestScore = (submissions: any[]) => {
    if (!submissions || submissions.length === 0) return null
    const bestSubmission = submissions.reduce((best, current) => {
      const currentScore = current.aiAnalysis?.score || 0
      const bestScore = best.aiAnalysis?.score || 0
      return currentScore > bestScore ? current : best
    })
    return bestSubmission.aiAnalysis?.score
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Code2 className="text-blue-600 dark:text-blue-400" />
                  Question Tracker
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track your coding practice with AI-powered insights
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Questions</h3>
                <Code2 className="text-blue-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Solved</h3>
                <CheckCircle2 className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.solved}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}% complete
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Attempted</h3>
                <Clock className="text-orange-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.attempted}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Todo</h3>
                <AlertCircle className="text-gray-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.todo}</p>
            </motion.div>
          </div>
        )}

        {/* Difficulty Progress */}
        {stats && stats.total > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Difficulty Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Easy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Easy</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.easySolved}/{stats.easy}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${stats.easy > 0 ? (stats.easySolved / stats.easy) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.mediumSolved}/{stats.medium}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${stats.medium > 0 ? (stats.mediumSolved / stats.medium) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Hard */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hard</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.hardSolved}/{stats.hard}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${stats.hard > 0 ? (stats.hardSolved / stats.hard) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="todo">Todo</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Platform Filter */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Platforms</option>
              <option value="leetcode">LeetCode</option>
              <option value="codeforces">CodeForces</option>
              <option value="hackerrank">HackerRank</option>
              <option value="codechef">CodeChef</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-12 shadow-lg border border-gray-200 dark:border-dark-700 text-center">
            <Code2 className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No questions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your coding practice by adding your first question
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/questions/${question._id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(question.status)}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {question.title}
                      </h3>
                      {question.isFavorite && (
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(question.status)}`}>
                        {question.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyBadge(question.difficulty)}`}>
                        {question.difficulty.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {question.platform.toUpperCase()}
                      </span>
                      {getBestScore(question.submissions) && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 flex items-center gap-1">
                          <TrendingUp size={12} />
                          AI Score: {getBestScore(question.submissions)}/100
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {question.attempts > 0 && (
                        <span className="flex items-center gap-1">
                          <Play size={14} />
                          {question.attempts} {question.attempts === 1 ? 'attempt' : 'attempts'}
                        </span>
                      )}
                      {question.solvedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Solved {new Date(question.solvedAt).toLocaleDateString()}
                        </span>
                      )}
                      {question.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag size={14} />
                          {question.tags.slice(0, 3).join(', ')}
                          {question.tags.length > 3 && ` +${question.tags.length - 3}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {question.platformUrl && (
                      <a
                        href={question.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        title="Open in platform"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/questions/${question._id}/edit`)
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteQuestion(question._id)
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add New Question
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddQuestion} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Two Sum"
                  />
                </div>

                {/* Platform and Difficulty Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform *
                    </label>
                    <select
                      value={newQuestion.platform}
                      onChange={(e) => setNewQuestion({ ...newQuestion, platform: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      <option value="leetcode">LeetCode</option>
                      <option value="codeforces">CodeForces</option>
                      <option value="hackerrank">HackerRank</option>
                      <option value="codechef">CodeChef</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform URL
                    </label>
                    <input
                      type="url"
                      value={newQuestion.platformUrl}
                      onChange={(e) => setNewQuestion({ ...newQuestion, platformUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="https://leetcode.com/problems/..."
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={newQuestion.description}
                    onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="Given an array of integers nums and an integer target..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="Add tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newQuestion.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topics (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-dark-600 rounded-lg p-3">
                    {availableTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          newQuestion.topics.includes(topic)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Cases */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Test Cases
                    </label>
                    <button
                      type="button"
                      onClick={addTestCase}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Test Case
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newQuestion.testCases.map((testCase, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={testCase.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          placeholder="Input (e.g., [2,7,11,15], 9)"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                        />
                        <input
                          type="text"
                          value={testCase.expectedOutput}
                          onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                          placeholder="Expected Output (e.g., [0,1])"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          disabled={newQuestion.testCases.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Constraints
                  </label>
                  <textarea
                    value={newQuestion.constraints}
                    onChange={(e) => setNewQuestion({ ...newQuestion, constraints: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                    placeholder="2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                  />
                </div>

                {/* Hints */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hints (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addHint}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Hint
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newQuestion.hints.map((hint, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={hint}
                          onChange={(e) => updateHint(index, e.target.value)}
                          placeholder={`Hint ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeHint(index)}
                          disabled={newQuestion.hints.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Notes
                  </label>
                  <textarea
                    value={newQuestion.notes}
                    onChange={(e) => setNewQuestion({ ...newQuestion, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                    placeholder="Add your personal notes, approaches, or learnings..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="px-6 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Adding...' : 'Add Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuestionTrackerPage
