import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Loader2, BookOpen, Play } from 'lucide-react'

interface Topic {
  _id?: string
  name?: string
}

const AptitudeHome: React.FC = () => {
  const navigate = useNavigate()
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy')
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [loading, setLoading] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoadingTopics(true)
        const response = await api.get('/aptitude/topics')
        const topicsData = response.data.topics || response.data.data || []
        setTopics(topicsData)
        if (topicsData.length > 0) {
          setSelectedTopic(topicsData[0])
        }
      } catch (err: any) {
        console.error('Error fetching topics:', err)
        setError(err.response?.data?.message || 'Failed to load topics')
      } finally {
        setLoadingTopics(false)
      }
    }

    fetchTopics()
  }, [])

  const handleStartQuiz = async () => {
    if (!selectedTopic) {
      setError('Please select a topic')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch questions
      const response = await api.get('/aptitude/questions', {
        params: {
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          limit: questionCount
        }
      })

      const questions = response.data.questions || response.data.data || []

      if (questions.length === 0) {
        setError('No questions available for the selected criteria')
        return
      }

      // Navigate to quiz page with state
      navigate('/aptitude/quiz', {
        state: {
          questions,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          startedAt: new Date().toISOString()
        }
      })
    } catch (err: any) {
      console.error('Error starting quiz:', err)
      setError(err.response?.data?.message || 'Failed to start quiz')
    } finally {
      setLoading(false)
    }
  }

  if (loadingTopics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">Loading topics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Aptitude Prep
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Practice aptitude questions to improve your skills
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Select Quiz Settings
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Count Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                onClick={handleStartQuiz}
                disabled={loading || !selectedTopic}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading Questions...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AptitudeHome

