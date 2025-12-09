import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Code2, RefreshCw, Clock, User, Trophy, TrendingUp, Award, Target, Unlink } from 'lucide-react'
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts'
import api from '../api/axios'

interface CodingProfile {
  _id: string
  platform: 'CODEFORCES' | 'HACKERRANK'
  handle: string
  profileUrl?: string
  lastSyncedAt: string | null
  stats: {
    totalSolved: number
    easySolved: number
    mediumSolved: number
    hardSolved: number
    rating: number | null
    maxRating: number | null
    contestsPlayed: number
    rank: string | null
  }
  createdAt: string
  updatedAt: string
}

const CodingPlatformsTab: React.FC = () => {
  const [codingProfiles, setCodingProfiles] = useState<CodingProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [platform, setPlatform] = useState<'CODEFORCES' | 'HACKERRANK'>('CODEFORCES')
  const [handle, setHandle] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Sync loading state per profile
  const [syncingProfiles, setSyncingProfiles] = useState<Set<string>>(new Set())
  
  // Selected profile state
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/coding-profiles/me')
        const profiles = response.data.data || []
        setCodingProfiles(profiles)
        
        // Auto-select first profile if none selected and profiles exist
        if (selectedProfileId === null && profiles.length > 0) {
          setSelectedProfileId(profiles[0]._id)
        }
      } catch (err: any) {
        console.error('Error fetching coding profiles:', err)
        setError(err.response?.data?.message || 'Failed to load coding profiles')
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Auto-select first profile when profiles change and none is selected
  useEffect(() => {
    if (selectedProfileId === null && codingProfiles.length > 0) {
      setSelectedProfileId(codingProfiles[0]._id)
    }
  }, [codingProfiles, selectedProfileId])

  const getPlatformDisplayName = (platform: string) => {
    switch (platform) {
      case 'CODEFORCES':
        return 'Codeforces'
      case 'HACKERRANK':
        return 'HackerRank'
      default:
        return platform
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSyncProfile = async (profileId: string) => {
    setSyncingProfiles(prev => new Set(prev).add(profileId))
    
    try {
      const response = await api.post(`/coding-profiles/${profileId}/sync`)
      
      if (response.data.success) {
        const updatedProfile = response.data.data
        
        // Update the profile in state
        setCodingProfiles(prev => 
          prev.map(profile => 
            profile._id === profileId ? updatedProfile : profile
          )
        )
        
        toast.success('Profile synced successfully!')
      }
    } catch (err: any) {
      console.error('Error syncing profile:', err)
      toast.error(err.response?.data?.message || 'Failed to sync profile')
    } finally {
      setSyncingProfiles(prev => {
        const next = new Set(prev)
        next.delete(profileId)
        return next
      })
    }
  }

  const handleUnlinkProfile = async (profileId: string) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to unlink this platform from your account?')) {
      return
    }

    try {
      const response = await api.delete(`/coding-profiles/${profileId}`)
      
      if (response.data.success) {
        // Remove the profile from state
        const updatedProfiles = codingProfiles.filter(profile => profile._id !== profileId)
        setCodingProfiles(updatedProfiles)
        
        // Update selected profile
        if (updatedProfiles.length > 0) {
          // Select the first remaining profile
          setSelectedProfileId(updatedProfiles[0]._id)
        } else {
          // No profiles left, clear selection
          setSelectedProfileId(null)
        }
        
        toast.success('Platform unlinked successfully')
      }
    } catch (err: any) {
      console.error('Error unlinking profile:', err)
      toast.error(err.response?.data?.message || 'Failed to unlink profile')
    }
  }

  const getPlatformIcon = (platform: string) => {
    return <Code2 size={20} className="text-blue-600 dark:text-blue-400" />
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'CODEFORCES':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'HACKERRANK':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!handle.trim()) {
      toast.error('Please enter a handle or profile URL')
      return
    }

    setSaving(true)
    try {
      const response = await api.post('/coding-profiles', {
        platform,
        handle: handle.trim(),
        profileUrl: profileUrl.trim() || undefined
      })

      if (response.data.success) {
        const savedProfile = response.data.data
        
        // Refresh profiles list to get latest data
        const profilesResponse = await api.get('/coding-profiles/me')
        const updatedProfiles = profilesResponse.data.data || []
        setCodingProfiles(updatedProfiles)
        
        // Select the saved profile (new or updated)
        setSelectedProfileId(savedProfile._id)

        // Clear form
        setHandle('')
        setProfileUrl('')
        
        toast.success(`${getPlatformDisplayName(platform)} profile saved successfully!`)
      }
    } catch (err: any) {
      console.error('Error saving coding profile:', err)
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const selectedProfile = codingProfiles.find(p => p._id === selectedProfileId)

  // Prepare chart data for selected profile
  const chartData = useMemo(() => {
    if (!selectedProfile) return null
    
    const stats = selectedProfile.stats || {}
    const totalSolved = stats.totalSolved || 0
    const easySolved = stats.easySolved || 0
    const mediumSolved = stats.mediumSolved || 0
    const hardSolved = stats.hardSolved || 0
    const rating = stats.rating || 0
    const maxRating = stats.maxRating || 0
    const contestsPlayed = stats.contestsPlayed || 0
    
    const difficultyData = [
      { name: 'Easy', value: easySolved, fill: '#22c55e' },
      { name: 'Medium', value: mediumSolved, fill: '#eab308' },
      { name: 'Hard', value: hardSolved, fill: '#ef4444' }
    ]
    
    const hasDifficultyData = easySolved > 0 || mediumSolved > 0 || hardSolved > 0
    
    const current = rating || 0
    const max = maxRating || 0
    const remaining = Math.max(0, max - current)
    
    const ratingData = [
      { name: 'Current Rating', value: current, fill: '#3b82f6' },
      { name: 'Remaining to Max', value: remaining, fill: '#64748b' }
    ]
    
    const hasRatingData = rating > 0 || maxRating > 0
    
    // Normalize values for radar chart (scale to 0-100)
    const maxProblems = Math.max(totalSolved, 100) || 100
    const maxContests = Math.max(contestsPlayed, 10) || 10
    const maxRatingValue = Math.max(maxRating, 2000) || 2000
    
    const radarData = [
      {
        subject: 'Problems',
        value: Math.min(100, (totalSolved / maxProblems) * 100),
        fullMark: 100
      },
      {
        subject: 'Contests',
        value: Math.min(100, (contestsPlayed / maxContests) * 100),
        fullMark: 100
      },
      {
        subject: 'Rating',
        value: Math.min(100, (rating / maxRatingValue) * 100),
        fullMark: 100
      }
    ]
    
    const hasRadarData = totalSolved > 0 || contestsPlayed > 0 || rating > 0
    
    return {
      stats,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      rating,
      maxRating,
      contestsPlayed,
      difficultyData,
      hasDifficultyData,
      ratingData,
      hasRatingData,
      radarData,
      hasRadarData
    }
  }, [selectedProfile])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Coding Platforms
        </h3>

        {loading && (
          <div className="text-center py-12 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading…
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Form and Platform List */}
            <div className="w-full lg:w-[30%] space-y-4">
              {/* Add / Update Platform Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-dark-700"
              >
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Add / Update Platform
                </h4>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as 'CODEFORCES' | 'HACKERRANK')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CODEFORCES">Codeforces</option>
                      <option value="HACKERRANK">HackerRank</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="Handle or Profile URL (e.g. john_doe or https://codeforces.com/profile/john_doe)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      placeholder="Profile URL (optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              </motion.div>

              {/* Platform List */}
              {codingProfiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-dark-700">
                    Connected Platforms
                  </h4>
                  <div className="divide-y divide-gray-200 dark:divide-dark-700">
                    {codingProfiles.map((profile) => (
                      <button
                        key={profile._id}
                        onClick={() => setSelectedProfileId(profile._id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                          selectedProfileId === profile._id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded ${getPlatformColor(profile.platform)}`}>
                            {getPlatformIcon(profile.platform)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {getPlatformDisplayName(profile.platform)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {profile.handle}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Detailed Stats */}
            <div className="w-full lg:w-[70%]">
              {selectedProfile ? (
                <motion.div
                  key={selectedProfile._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-dark-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-dark-700"
                >
                  {(() => {
                    if (!chartData) return null
                    
                    const isSyncing = syncingProfiles.has(selectedProfile._id)
                    const {
                      stats,
                      totalSolved,
                      easySolved,
                      mediumSolved,
                      hardSolved,
                      rating,
                      maxRating,
                      difficultyData,
                      hasDifficultyData,
                      ratingData,
                      hasRatingData,
                      radarData,
                      hasRadarData
                    } = chartData
                    
                    return (
                      <>
                        {/* Header with Platform Info, Sync and Unlink Buttons */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getPlatformColor(selectedProfile.platform)}`}>
                              {getPlatformIcon(selectedProfile.platform)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                {getPlatformDisplayName(selectedProfile.platform)}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <User size={14} className="text-gray-400 dark:text-gray-500" />
                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                  {selectedProfile.handle}
                                </code>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSyncProfile(selectedProfile._id)}
                              disabled={isSyncing}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              {isSyncing ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  <span>Syncing...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={16} />
                                  <span>Sync Now</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleUnlinkProfile(selectedProfile._id)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                              <Unlink size={16} />
                              <span>Unlink</span>
                            </button>
                          </div>
                        </div>

                        {/* Last Synced Info */}
                        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={14} />
                          <span>Last synced: {formatDate(selectedProfile.lastSyncedAt)}</span>
                        </div>

                        {/* Compact Stat Chips */}
                        <div className="flex gap-3 mb-6">
                          <div className="flex-1 bg-gray-50 dark:bg-dark-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Solved</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {stats.totalSolved !== null && stats.totalSolved !== undefined ? stats.totalSolved : '—'}
                            </p>
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-dark-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rating</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {stats.rating !== null && stats.rating !== undefined ? stats.rating : '—'}
                            </p>
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-dark-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Rating</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {stats.maxRating !== null && stats.maxRating !== undefined ? stats.maxRating : '—'}
                            </p>
                          </div>
                        </div>

                        {/* Difficulty Overview - Radial Chart */}
                        <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 mb-4 border border-gray-200 dark:border-dark-600">
                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Difficulty Overview
                          </h5>
                          {hasDifficultyData ? (
                            <div className="flex items-center gap-6">
                              <div className="w-48 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadialBarChart
                                    innerRadius="60%"
                                    outerRadius="90%"
                                    data={difficultyData}
                                    startAngle={90}
                                    endAngle={-270}
                                  >
                                    <RadialBar
                                      dataKey="value"
                                      cornerRadius={8}
                                    >
                                      {difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                    </RadialBar>
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                      }}
                                    />
                                  </RadialBarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Easy</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{easySolved}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Medium</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{mediumSolved}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Hard</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{hardSolved}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Difficulty breakdown not available yet for this platform.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Performance Snapshot - Donut Chart */}
                        <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 mb-4 border border-gray-200 dark:border-dark-600">
                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Performance Snapshot
                          </h5>
                          {hasRatingData ? (
                            <div className="space-y-4">
                              <div className="flex justify-center">
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={ratingData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={90}
                                      paddingAngle={5}
                                      dataKey="value"
                                    >
                                      {ratingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Current: <span className="font-bold text-gray-900 dark:text-white">{rating}</span> | Max: <span className="font-bold text-gray-900 dark:text-white">{maxRating}</span>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Rating data not available.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Performance Comparison - Radar Chart */}
                        {hasRadarData && (
                          <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
                            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                              Performance Comparison
                            </h5>
                            <ResponsiveContainer width="100%" height={250}>
                              <RadarChart data={radarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis
                                  dataKey="subject"
                                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                  angle={90}
                                  domain={[0, 100]}
                                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                                />
                                <Radar
                                  name="Performance"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.6}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff'
                                  }}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-dark-800 rounded-xl p-12 shadow-sm border border-gray-200 dark:border-dark-700 text-center">
                  <Code2 size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Connect a platform to see stats
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CodingPlatformsTab

