import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Edit, X, Loader2, Star, GitFork, Calendar, ExternalLink, Users, FolderGit2 } from 'lucide-react'
import { githubAPI } from '../api/services'
import { toast } from 'react-hot-toast'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'

interface GitHubStats {
  profile: {
    name: string
    username: string
    avatarUrl: string | null
    bio: string | null
    publicRepos: number
    followers: number
    following: number
    htmlUrl: string
  }
  summary: {
    totalStars: number
    totalForks: number
    lastActive: string | null
  }
  languages: Array<{ name: string; count: number }>
  topRepos: Array<{
    name: string
    description: string
    language: string | null
    stars: number
    forks: number
    htmlUrl: string
    updatedAt: string
  }>
}

const GitHubStatsSection: React.FC = () => {
  const [githubUsername, setGithubUsername] = useState<string | null>(null)
  const [isEditingGithub, setIsEditingGithub] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Fetch GitHub username on mount
  useEffect(() => {
    const fetchGithubProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await githubAPI.getGithubProfile()
        if (response.success && response.data?.githubUsername) {
          setGithubUsername(response.data.githubUsername)
        }
      } catch (err: any) {
        console.error('Error fetching GitHub profile:', err)
        setError(err.response?.data?.message || 'Failed to load GitHub profile')
      } finally {
        setLoading(false)
      }
    }

    fetchGithubProfile()
  }, [])

  // Fetch GitHub stats when username is available
  useEffect(() => {
    const fetchGithubStats = async () => {
      if (!githubUsername) {
        setStats(null)
        return
      }

      try {
        setStatsLoading(true)
        setStatsError(null)
        const response = await githubAPI.getGithubStats()
        if (response.success && response.data) {
          setStats(response.data)
        }
      } catch (err: any) {
        console.error('Error fetching GitHub stats:', err)
        setStatsError(err.response?.data?.message || 'Could not load GitHub data')
      } finally {
        setStatsLoading(false)
      }
    }

    fetchGithubStats()
  }, [githubUsername])

  const handleOpenModal = () => {
    setInputValue(githubUsername || '')
    setIsEditingGithub(true)
  }

  const handleCloseModal = () => {
    setIsEditingGithub(false)
    setInputValue('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) {
      toast.error('Please enter a GitHub username or profile URL')
      return
    }

    setSaving(true)
    try {
      const response = await githubAPI.updateGithubProfile(inputValue.trim())
      
      if (response.success) {
        const updatedUsername = response.data?.githubUsername || null
        setGithubUsername(updatedUsername)
        setIsEditingGithub(false)
        setInputValue('')
        setStats(null) // Reset stats to trigger refetch
        toast.success('GitHub profile updated successfully!')
      }
    } catch (err: any) {
      console.error('Error updating GitHub profile:', err)
      toast.error(err.response?.data?.message || 'Failed to update GitHub profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    )
  }

  if (error && !githubUsername) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add GitHub Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700">
        {!githubUsername ? (
          // Empty State
          <div className="text-center py-8">
            <Github className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={48} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              GitHub Stats & Projects
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Connect your GitHub to see activity and top projects.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add GitHub Profile
            </button>
          </div>
        ) : (
          // Configured State
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  GitHub Stats & Projects
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connected GitHub: <span className="font-mono text-blue-600 dark:text-blue-400">@{githubUsername}</span>
                </p>
              </div>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
            
            {/* GitHub Stats Display */}
            {statsLoading ? (
              <div className="mt-6 text-center py-8 text-gray-500 dark:text-gray-400">
                <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                <p className="text-sm">Fetching GitHub stats...</p>
              </div>
            ) : statsError ? (
              <div className="mt-6 text-center py-8">
                <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                  Could not load GitHub data
                </p>
                <button
                  onClick={() => {
                    setStatsError(null)
                    setStatsLoading(true)
                    githubAPI.getGithubStats()
                      .then(response => {
                        if (response.success && response.data) {
                          setStats(response.data)
                        }
                      })
                      .catch(err => {
                        setStatsError(err.response?.data?.message || 'Could not load GitHub data')
                      })
                      .finally(() => setStatsLoading(false))
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            ) : stats ? (
              <div className="mt-6 space-y-6">
                {/* (a) Profile Snapshot */}
                <div className="border-b border-gray-200 dark:border-dark-700 pb-6">
                  <div className="flex items-start gap-4 mb-4">
                    {stats.profile.avatarUrl ? (
                      <img
                        src={stats.profile.avatarUrl}
                        alt={stats.profile.username}
                        className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-dark-600"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-700 flex items-center justify-center">
                        <Github className="text-gray-400 dark:text-gray-600" size={32} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.profile.name || stats.profile.username}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        @{stats.profile.username}
                      </p>
                      {stats.profile.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {stats.profile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Chips */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
                      <FolderGit2 size={16} className="text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stats.profile.publicRepos} Repos
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
                      <Users size={16} className="text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stats.profile.followers} Followers
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
                      <Users size={16} className="text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stats.profile.following} Following
                      </span>
                    </div>
                  </div>
                </div>

                {/* (b) Summary + Languages */}
                <div className="border-b border-gray-200 dark:border-dark-700 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h4>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="text-yellow-500" size={20} />
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Stars</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.summary.totalStars}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600">
                      <div className="flex items-center gap-2 mb-2">
                        <GitFork className="text-blue-500" size={20} />
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Forks</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.summary.totalForks}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-green-500" size={20} />
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Active</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {stats.summary.lastActive
                          ? new Date(stats.summary.lastActive).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'No activity yet'}
                      </p>
                    </div>
                  </div>

                  {/* Languages Chart */}
                  {stats.languages.length > 0 ? (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Languages</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chart */}
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.languages.map(lang => ({ name: lang.name, value: lang.count }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {stats.languages.map((entry, index) => {
                                  const colors = [
                                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                                    '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1'
                                  ]
                                  return (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={colors[index % colors.length]}
                                    />
                                  )
                                })}
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
                        
                        {/* Legend */}
                        <div className="flex flex-col justify-center">
                          <div className="space-y-2">
                            {stats.languages.map((lang, index) => {
                              const colors = [
                                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                                '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1'
                              ]
                              return (
                                <div key={index} className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                    {lang.name}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {lang.count}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No public repositories with detectable languages yet.</p>
                    </div>
                  )}
                </div>

                {/* (c) Top Repositories */}
                {stats.topRepos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Repositories</h4>
                    <div className="space-y-3">
                      {stats.topRepos.map((repo, index) => {
                        const updatedDate = new Date(repo.updatedAt)
                        const now = new Date()
                        const diffTime = Math.abs(now.getTime() - updatedDate.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        const relativeDate =
                          diffDays === 0
                            ? 'today'
                            : diffDays === 1
                            ? 'yesterday'
                            : diffDays < 7
                            ? `${diffDays} days ago`
                            : diffDays < 30
                            ? `${Math.floor(diffDays / 7)} weeks ago`
                            : updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: updatedDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })

                        return (
                          <div
                            key={index}
                            className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <a
                                    href={repo.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                  >
                                    {repo.name}
                                    <ExternalLink size={14} />
                                  </a>
                                  {repo.language && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                      {repo.language}
                                    </span>
                                  )}
                                </div>
                                {repo.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                    {repo.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Star size={14} />
                                    <span>{repo.stars}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <GitFork size={14} />
                                    <span>{repo.forks}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>Updated {relativeDate}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit GitHub Username */}
      <AnimatePresence>
        {isEditingGithub && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={handleCloseModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-dark-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {githubUsername ? 'Edit GitHub Profile' : 'Add GitHub Profile'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub username or profile URL
                    </label>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. username or https://github.com/username"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      disabled={saving}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      You can enter just the username or the full GitHub profile URL
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={saving}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !inputValue.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default GitHubStatsSection

