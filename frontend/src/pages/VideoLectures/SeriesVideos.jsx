import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { videoLectureAPI } from '../../api/services'
import { Card, Loader, ErrorMessage } from '../../components/SmallUIHelpers'
import { ArrowLeft, Play, Clock } from 'lucide-react'

const SeriesVideos = () => {
  const { seriesId } = useParams()
  const navigate = useNavigate()
  const [series, setSeries] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!seriesId) {
      setError('Series ID is required')
      setLoading(false)
      return
    }

    fetchSeriesData()
  }, [seriesId])

  const fetchSeriesData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch series metadata and videos in parallel
      const [seriesResponse, videosResponse] = await Promise.all([
        videoLectureAPI.getSeriesById(seriesId),
        videoLectureAPI.getVideosBySeries(seriesId)
      ])

      // Handle series metadata
      if (seriesResponse.success && seriesResponse.data) {
        setSeries(seriesResponse.data)
      } else if (seriesResponse.data) {
        // Handle case where response doesn't have success flag
        setSeries(seriesResponse.data)
      }

      // Handle videos
      if (videosResponse.success && Array.isArray(videosResponse.data)) {
        setVideos(videosResponse.data)
      } else if (Array.isArray(videosResponse.data)) {
        setVideos(videosResponse.data)
      } else if (Array.isArray(videosResponse)) {
        // Handle direct array response
        setVideos(videosResponse)
      }
    } catch (err) {
      console.error('Error fetching series data:', err)
      setError('Failed to load series. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleVideoClick = (videoId) => {
    navigate(`/video-lectures/video/${videoId}`)
  }

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
          <button
            onClick={() => navigate('/video-lectures')}
            className="mb-4 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lectures
          </button>
          <ErrorMessage message={error} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-dark-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <button
          onClick={() => navigate('/video-lectures')}
          className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Lectures
        </button>

        {/* Series title */}
        {series && (
          <h1 className="text-3xl font-bold text-white mb-2">
            {series.title || series.name || 'Video Series'}
          </h1>
        )}
        {series && series.description && (
          <p className="text-gray-400 mb-8">{series.description}</p>
        )}

        {/* Videos grid */}
        {videos.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No videos found in this series.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Card
                key={video._id || video.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                testId={`video-item-${video._id || video.id}`}
              >
                {/* Thumbnail */}
                {video.thumbnail && (
                  <div className="relative w-full aspect-video bg-gray-800 dark:bg-dark-700 mb-4 overflow-hidden rounded-t-lg">
                    <img
                      src={video.thumbnail}
                      alt={video.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                      <Play className="w-12 h-12 text-white opacity-80" />
                    </div>
                  </div>
                )}

                {/* Video info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title || 'Untitled Video'}
                  </h3>

                  {/* Duration */}
                  {video.durationSeconds && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDuration(video.durationSeconds)}</span>
                    </div>
                  )}

                  {/* Start button */}
                  <button
                    onClick={() => handleVideoClick(video._id || video.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeriesVideos

