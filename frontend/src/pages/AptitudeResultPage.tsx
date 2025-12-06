import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { aptitudeAPI, AptitudeAttemptResponse } from '../api/services'
import { Loader2, CheckCircle2, XCircle, BookOpen, TrendingUp, ArrowLeft } from 'lucide-react'

const AptitudeResultPage: React.FC = () => {
  const navigate = useNavigate()
  const { attemptId } = useParams<{ attemptId: string }>()
  const location = useLocation()
  const [attemptData, setAttemptData] = useState<AptitudeAttemptResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    // Check if attempt data was passed via state
    const stateData = location.state?.attemptData as AptitudeAttemptResponse | undefined
    if (stateData) {
      setAttemptData(stateData)
      setLoading(false)
    } else if (attemptId) {
      // If no state data, we would fetch by attemptId, but this endpoint doesn't exist yet
      // For now, show error
      setError('Attempt data not found. Please try again.')
      setLoading(false)
    } else {
      setError('Invalid attempt ID')
      setLoading(false)
    }
  }, [attemptId, location])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !attemptData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Results not found'}
          </h2>
          <button
            onClick={() => navigate('/aptitude')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Aptitude Prep
          </button>
        </div>
      </div>
    )
  }

  const correctCount = attemptData.answers.filter((a) => a.isCorrect).length
  const incorrectCount = attemptData.answers.length - correctCount

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quiz Results
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {attemptData.topic} • {attemptData.difficulty}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/aptitude')}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <span className="text-3xl font-bold text-white">{attemptData.percentage}%</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {attemptData.score} / {attemptData.numQuestions} Correct
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Completed on {new Date(attemptData.completedAt).toLocaleString()}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {correctCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {incorrectCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>{showReview ? 'Hide' : 'Show'} Detailed Review</span>
          </button>
        </div>

        {/* Detailed Review */}
        {showReview && (
          <div className="space-y-4">
            {attemptData.answers.map((answer, index) => (
              <div
                key={answer.questionId}
                className={`bg-white dark:bg-dark-800 rounded-xl border-2 p-6 ${
                  answer.isCorrect
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Question {index + 1}
                    </span>
                    {answer.isCorrect ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                        Correct
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {answer.questionText}
                </h3>

                <div className="space-y-2 mb-4">
                  {answer.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`px-4 py-2 rounded-lg border ${
                        optIndex === answer.correctIndex
                          ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                          : optIndex === answer.selectedIndex && !answer.isCorrect
                          ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-dark-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {optIndex === answer.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                        {optIndex === answer.selectedIndex && !answer.isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={
                            optIndex === answer.correctIndex
                              ? 'text-green-700 dark:text-green-300 font-medium'
                              : optIndex === answer.selectedIndex && !answer.isCorrect
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }
                        >
                          {option}
                        </span>
                        {optIndex === answer.correctIndex && (
                          <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                            Correct Answer
                          </span>
                        )}
                        {optIndex === answer.selectedIndex && !answer.isCorrect && (
                          <span className="ml-auto text-xs text-red-600 dark:text-red-400 font-medium">
                            Your Answer
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {answer.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {answer.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/aptitude')}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Take Another Quiz
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AptitudeResultPage

