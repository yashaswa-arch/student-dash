import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react'

interface Question {
  _id: string
  topic: string
  questionText: string
  options: string[]
  difficulty: string
}

interface QuizState {
  questions: Question[]
  topic: string
  difficulty: string
  startedAt: string
}

interface Answer {
  selectedIndex: number
  timeTakenSec: number
}

const AptitudeQuiz: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Track time per question
  const questionStartTimeRef = useRef<number>(Date.now())
  const currentQuestionIdRef = useRef<string | null>(null)

  useEffect(() => {
    const state = location.state as QuizState
    if (!state || !state.questions || state.questions.length === 0) {
      navigate('/aptitude')
      return
    }
    setQuizState(state)
    currentQuestionIdRef.current = state.questions[0]._id
    questionStartTimeRef.current = Date.now()
  }, [location, navigate])

  // Update time when question changes
  useEffect(() => {
    if (!quizState || quizState.questions.length === 0) return

    const currentQuestionId = quizState.questions[currentIndex]?._id
    if (!currentQuestionId) return

    // Save time for previous question
    if (currentQuestionIdRef.current && currentQuestionIdRef.current !== currentQuestionId) {
      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000)
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIdRef.current!]: {
          ...prev[currentQuestionIdRef.current!],
          timeTakenSec: (prev[currentQuestionIdRef.current!]?.timeTakenSec || 0) + timeSpent
        }
      }))
    }

    // Start timer for new question
    currentQuestionIdRef.current = currentQuestionId
    questionStartTimeRef.current = Date.now()
  }, [currentIndex, quizState])

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedIndex: optionIndex,
        timeTakenSec: prev[questionId]?.timeTakenSec || 0
      }
    }))
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (quizState && currentIndex < quizState.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (!quizState) return

    // Finalize time for current question
    if (currentQuestionIdRef.current) {
      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000)
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIdRef.current!]: {
          ...prev[currentQuestionIdRef.current!],
          timeTakenSec: (prev[currentQuestionIdRef.current!]?.timeTakenSec || 0) + timeSpent
        }
      }))
    }

    try {
      setSubmitting(true)
      setError(null)

      // Build responses array
      const responses = quizState.questions.map(question => {
        const answer = answers[question._id]
        return {
          questionId: question._id,
          selectedIndex: answer?.selectedIndex !== undefined ? answer.selectedIndex : -1,
          timeTakenSec: answer?.timeTakenSec || 0
        }
      })

      // Submit attempt
      const response = await api.post('/aptitude/attempts', {
        topic: quizState.topic,
        difficulty: quizState.difficulty,
        startedAt: quizState.startedAt,
        responses: responses
      })

      const attempt = response.data.attempt || response.data.data

      // Navigate to result page
      navigate('/aptitude/result', {
        state: { attempt }
      })
    } catch (err: any) {
      console.error('Error submitting quiz:', err)
      setError(err.response?.data?.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (!quizState) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = quizState.questions[currentIndex]
  const selectedAnswer = answers[currentQuestion._id]?.selectedIndex
  const progress = ((currentIndex + 1) / quizState.questions.length) * 100
  const answeredCount = Object.values(answers).filter(a => a.selectedIndex !== undefined && a.selectedIndex !== -1).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {quizState.topic}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {quizState.difficulty} • {quizState.questions.length} Questions
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {answeredCount} / {quizState.questions.length} Answered
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 p-6">
          {/* Question Number */}
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Question {currentIndex + 1} of {quizState.questions.length}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {currentQuestion.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion._id, index)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400'
                        : 'border-gray-300 dark:border-dark-500'
                    }`}
                  >
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-dark-700">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {currentIndex < quizState.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AptitudeQuiz

