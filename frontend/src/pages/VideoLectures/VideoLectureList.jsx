import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { videoLectureAPI } from '../../api/services'
import { Card, Loader, ErrorMessage } from '../../components/SmallUIHelpers'
import { BookOpen, PlayCircle, Filter } from 'lucide-react'

const VideoLectureList = () => {
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [series, setSeries] = useState([])
  const [filteredSeries, setFilteredSeries] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Filter series based on selected topic
    if (selectedTopic === null) {
      setFilteredSeries(series)
    } else {
      setFilteredSeries(series.filter(s => {
        const topicId = s.topicId || s.topic?._id || s.topic
        return topicId === selectedTopic
      }))
    }
  }, [selectedTopic, series])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch topics and series in parallel
      const [topicsResponse, seriesResponse] = await Promise.all([
        videoLectureAPI.getTopics(),
        videoLectureAPI.getSeries()
      ])

      // Handle topics
      let topicsData = []
      if (topicsResponse.success && Array.isArray(topicsResponse.data)) {
        topicsData = topicsResponse.data
      } else if (Array.isArray(topicsResponse.data)) {
        topicsData = topicsResponse.data
      } else if (Array.isArray(topicsResponse)) {
        topicsData = topicsResponse
      }

      // Handle series
      let seriesData = []
      if (seriesResponse.success && Array.isArray(seriesResponse.data)) {
        seriesData = seriesResponse.data
      } else if (Array.isArray(seriesResponse.data)) {
        seriesData = seriesResponse.data
      } else if (Array.isArray(seriesResponse)) {
        seriesData = seriesResponse
      }

      setSeries(seriesData)

      // If topics API doesn't exist or returned empty, derive topics from series
      if (topicsData.length === 0 && seriesData.length > 0) {
        const derivedTopics = {}
        seriesData.forEach(s => {
          const topicId = s.topicId || s.topic?._id || s.topic
          const topicName = s.topic?.name || 'Uncategorized'
          if (topicId && !derivedTopics[topicId]) {
            derivedTopics[topicId] = { _id: topicId, name: topicName }
          }
        })
        topicsData = Object.values(derivedTopics)
      }

      setTopics(topicsData)
      setFilteredSeries(seriesData)
    } catch (err) {
      console.error('Error fetching video lecture data:', err)
      setError('Failed to load video lectures. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId)
  }

  const handleSeriesClick = (seriesId) => {
    navigate(`/video-lectures/series/${seriesId}`)
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
          <ErrorMessage message={error} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-dark-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Video Lectures</h1>
          <p className="text-gray-400">Interactive lectures with timed pop-up quizzes</p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topics sidebar (left) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Topics</h2>
              </div>
              
              <button
                onClick={() => handleTopicSelect(null)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
                  selectedTopic === null
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
              >
                All Topics
              </button>

              {topics.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No topics available</p>
              ) : (
                <div className="space-y-1">
                  {topics.map((topic) => (
                    <button
                      key={topic._id || topic.id}
                      onClick={() => handleTopicSelect(topic._id || topic.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                        selectedTopic === (topic._id || topic.id)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {topic.name || 'Unnamed Topic'}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Series grid (right) */}
          <div className="lg:col-span-3">
            {filteredSeries.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedTopic ? 'No series found for this topic.' : 'No video series available.'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSeries.map((seriesItem) => (
                  <Card
                    key={seriesItem._id || seriesItem.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleSeriesClick(seriesItem._id || seriesItem.id)}
                    testId={`series-card-${seriesItem._id || seriesItem.id}`}
                  >
                    {/* Thumbnail */}
                    {seriesItem.thumbnail && (
                      <div className="relative w-full aspect-video bg-gray-800 dark:bg-dark-700 mb-4 overflow-hidden rounded-t-lg">
                        <img
                          src={seriesItem.thumbnail}
                          alt={seriesItem.title || 'Series thumbnail'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                          <PlayCircle className="w-16 h-16 text-white opacity-80" />
                        </div>
                      </div>
                    )}

                    {/* Series info */}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {seriesItem.title || 'Untitled Series'}
                      </h3>
                      {seriesItem.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                          {seriesItem.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                        <span>View Series</span>
                        <PlayCircle className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoLectureList

