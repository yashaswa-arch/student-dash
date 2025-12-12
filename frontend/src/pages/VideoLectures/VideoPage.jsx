import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { videoLectureAPI } from '../../api/services'
import VideoLecturePlayer from '../../components/VideoLecturePlayer'
import { Card, Loader, ErrorMessage } from '../../components/SmallUIHelpers'
import { CheckCircle2, XCircle, Circle, TrendingUp } from 'lucide-react'

const VideoPage = () => {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [presenceSummary, setPresenceSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!videoId) {
      setError('Video ID is required')
      setLoading(false)
      return
    }

    fetchVideoData()
  }, [videoId])

  const fetchVideoData = async () => {
    try {
      setLoading(true)
      setError(null)

      const videoResponse = await videoLectureAPI.getVideo(videoId)
      
      // Handle different response formats
      if (videoResponse.success && videoResponse.data) {
        setVideo(videoResponse.data)
      } else if (videoResponse.title || videoResponse.src) {
        setVideo(videoResponse)
      } else if (videoResponse.data) {
        setVideo(videoResponse.data)
      } else {
        throw new Error('Invalid video data format')
      }

      // Presence summary would be updated from player component responses
      // For now, we'll initialize with empty state
      // This can be enhanced when VideoLecturePlayer provides summary updates
      setPresenceSummary({
        quizzesAnswered: 0,
        quizzesCorrect: 0,
        quizzesIncorrect: 0,
        quizzesUnanswered: 0,
        presenceScore: 0
      })
    } catch (err) {
      console.error('Error fetching video data:', err)
      setError('Failed to load video. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Note: Presence summary would be updated from VideoLecturePlayer component responses
  // when quiz submissions are made. The player component would need to be enhanced
  // to provide this functionality. For now, the summary is initialized with empty state.

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 dark:bg-dark-900 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 dark:bg-dark-900 p-4">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage message={error} />
        </div>
      </div>
    )
  }

  const totalQuizzes = presenceSummary?.quizzesAnswered || 0
  const correctCount = presenceSummary?.quizzesCorrect || 0
  const incorrectCount = (presenceSummary?.quizzesAnswered || 0) - (presenceSummary?.quizzesCorrect || 0)
  const unansweredCount = presenceSummary?.quizzesUnanswered || 0
  const score = presenceSummary?.presenceScore || 0

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-dark-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {video?.title || 'Video Lecture'}
          </h1>
          <p className="text-gray-400">Pop-up quizzes enabled</p>
        </div>

        {/* Main content - responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video player - takes 2 columns on desktop */}
          <div className="lg:col-span-2" data-testid={`video-player-${videoId}`}>
            <Card className="p-0 overflow-hidden">
              <VideoLecturePlayer 
                videoId={videoId} 
                onPresenceUpdate={(summary) => {
                  setPresenceSummary(summary);
                }}
              />
            </Card>
          </div>

          {/* Presence summary sidebar - 1 column on desktop */}
          <div className="lg:col-span-1">
            <Card>
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Presence Summary
                </h2>
              </div>

              {/* Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Presence Score</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>

              {/* Quiz statistics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Correct</span>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {correctCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Incorrect</span>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {incorrectCount}
                  </span>
                </div>

                {unansweredCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <Circle className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Unanswered</span>
                    </div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      {unansweredCount}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Answered</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalQuizzes}
                    </span>
                  </div>
                </div>
              </div>

              {totalQuizzes === 0 && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Start watching to see your quiz performance
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPage

