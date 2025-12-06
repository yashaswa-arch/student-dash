import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { aptitudeAPI, AptitudeQuestion, AptitudeAnswer } from '../api/services'
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

interface QuizState {
  questions: AptitudeQuestion[]
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  numQuestions: 10 | 20
}

const AptitudeQuizPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, number>>(new Map())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get quiz state from location
    const state = location.state as QuizState
    if (!state || !state.questions || state.questions.length === 0) {
      // Redirect to aptitude page if no state
      navigate('/aptitude')
      return
    }
    setQuizState(state)
  }, [location, navigate])

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev)
      newAnswers.set(questionId, optionIndex)
      return newAnswers
    })
  }

  const handleNext = () => {
    if (quizState && currentQuestionIndex < quizState.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quizState) return

    // Check if all questions are answered
    const unanswered = quizState.questions.filter(
      (q) => !answers.has(q._id)
    )

    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
      )
      if (!confirmSubmit) return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Prepare answers array
      const answersArray: AptitudeAnswer[] = quizState.questions.map((q) => ({
        questionId: q._id,
        selectedIndex: answers.get(q._id) ?? -1 // -1 if not answered
      }))

      // Submit attempt
      const result = await aptitudeAPI.submitAttempt(
        quizState.topic,
        quizState.difficulty,
        quizState.numQuestions,
        answersArray
      )

      // Navigate to result page with attempt ID
      navigate(`/aptitude/result/${result._id}`, {
        state: { attemptData: result }
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

  const currentQuestion = quizState.questions[currentQuestionIndex]
  const selectedAnswer = answers.get(currentQuestion._id)
  const progress = ((currentQuestionIndex + 1) / quizState.questions.length) * 100
  const answeredCount = Array.from(answers.values()).filter((v) => v !== undefined && v !== -1).length

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
                {quizState.difficulty} • {quizState.numQuestions} Questions
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
              Question {currentQuestionIndex + 1} of {quizState.questions.length}
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
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="flex gap-2">
              {quizState.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers.has(quizState.questions[index]._id)
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex < quizState.questions.length - 1 ? (
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

export default AptitudeQuizPage

