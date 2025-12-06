import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { aptitudeAPI, AptitudeQuestion } from '../api/services'
import { Loader2, BookOpen, TrendingUp, Clock } from 'lucide-react'

const AptitudePage: React.FC = () => {
  const navigate = useNavigate()
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [selectedCount, setSelectedCount] = useState<10 | 20>(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingTopics, setLoadingTopics] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoadingTopics(true)
        const topicsData = await aptitudeAPI.getTopics()
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
      const questions = await aptitudeAPI.getQuestions(
        selectedTopic,
        selectedDifficulty,
        selectedCount
      )

      // Navigate to quiz page with questions via state
      navigate('/aptitude/quiz', {
        state: {
          questions,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          numQuestions: selectedCount
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedTopic === topic
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="font-medium">{topic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                      selectedDifficulty === difficulty
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([10, 20] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedCount === count
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">{count} Questions</span>
                    </div>
                  </button>
                ))}
              </div>
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
                    <TrendingUp className="w-5 h-5" />
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

export default AptitudePage

