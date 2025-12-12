import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Code2,
  RefreshCw,
  Clock,
  Unlink,
  Link as LinkIcon,
  Trophy,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import api from '../api/axios'

type Platform = 'codeforces' | 'leetcode' | 'hackerrank'

interface CodingProfile {
  _id: string
  platform: Platform
  handle: string
  profileUrl?: string
  displayName?: string
  avatarUrl?: string
  lastSyncedAt: string | null
  stats: {
    totalSolved: number | null
    easySolved: number | null
    mediumSolved: number | null
    hardSolved: number | null
    rating: number | null
    maxRating: number | null
    badges?: Array<{ name: string; level: string }>
    lastContest?: string | null
  }
  createdAt: string
  updatedAt: string
}

interface ProfileSummary {
  totalSolved: number
  platformsConnected: number
  lastSyncedAt: string | null
}

interface SummaryResponse {
  success: boolean
  summary: ProfileSummary
  platforms: CodingProfile[]
}

// Utility function to format time ago
const formatTimeAgo = (dateString: string | null): string => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const getPlatformName = (platform: Platform): string => {
  switch (platform) {
    case 'codeforces':
      return 'Codeforces'
    case 'leetcode':
      return 'LeetCode'
    case 'hackerrank':
      return 'HackerRank'
    default:
      return platform
  }
}

const getPlatformIcon = () => {
  return <Code2 size={18} />
}

// Sidebar Platform List Item
interface PlatformListItemProps {
  platform: Platform
  profile: CodingProfile | null
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  onSync: () => void
  onUnlink: () => void
  isSyncing: boolean
  onLink: (input: string) => void
  isLinking: boolean
}

const PlatformListItem: React.FC<PlatformListItemProps> = ({
  platform,
  profile,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onSync,
  onUnlink,
  isSyncing,
  onLink,
  isLinking
}) => {
  const [input, setInput] = useState('')

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      toast.error('Please enter a handle or profile URL')
      return
    }
    onLink(input.trim())
    setInput('')
  }

  return (
    <div className={`border-b border-gray-200 dark:border-dark-700 ${isSelected && profile ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
      <div className="flex items-center">
        {profile && (
          <button
            onClick={onSelect}
            className={`flex-1 flex items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-left ${
              isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
          >
            {getPlatformIcon()}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {getPlatformName(platform)}
            </span>
            <CheckCircle2 size={14} className="text-green-500 ml-auto" />
          </button>
        )}
        <button
          onClick={onToggle}
          className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
            profile ? 'border-l border-gray-200 dark:border-dark-700' : 'flex-1'
          } ${!profile ? 'w-full' : ''}`}
        >
          {!profile && (
            <>
              <div className="flex items-center gap-2 flex-1">
                {getPlatformIcon()}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getPlatformName(platform)}
                </span>
                <AlertCircle size={14} className="text-yellow-500 ml-auto" />
              </div>
            </>
          )}
          {profile?.profileUrl && (
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-dark-600 rounded mr-2"
            >
              <ExternalLink size={14} className="text-gray-400" />
            </a>
          )}
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-gray-50 dark:bg-dark-800 space-y-3">
              {profile ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {profile.handle}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={12} />
                      <span>Last synced: {formatTimeAgo(profile.lastSyncedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onSync}
                      disabled={isSyncing}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-medium transition-colors"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={12} />
                          <span>Sync</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={onUnlink}
                      className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium transition-colors"
                    >
                      <Unlink size={12} />
                      <span>Unlink</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleLinkSubmit} className="space-y-2">
                  <input
                    type="text"
                    id={`platform-input-${platform}`}
                    name={`platform-input-${platform}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Handle or profile URL"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-dark-700 rounded bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLinking}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={isLinking || !input.trim()}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-medium transition-colors"
                  >
                    {isLinking ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Linking...</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon size={12} />
                        <span>Link {getPlatformName(platform)}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main Content - Platform Details View
interface PlatformDetailsViewProps {
  profile: CodingProfile | null
  platform: Platform
}

const PlatformDetailsView: React.FC<PlatformDetailsViewProps> = ({ profile, platform }) => {
  if (!profile) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-dark-700 text-center">
        <Code2 size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Connect your {getPlatformName(platform)} profile to see detailed stats
        </p>
      </div>
    )
  }

  const stats = profile.stats || {}

  // Codeforces view
  if (platform === 'codeforces') {
    const rating = stats.rating ?? 0
    const maxRating = stats.maxRating ?? 0
    const totalSolved = stats.totalSolved ?? 0

    // Generate rating progression data (last 6 months)
    const generateRatingData = (): Array<{ month: string; rating: number; maxRating: number }> => {
      const data: Array<{ month: string; rating: number; maxRating: number }> = []
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const baseRating = Math.max(1200, rating - 300)
      
      months.forEach((month, index) => {
        const progress = (index + 1) / months.length
        const monthRating = Math.round(baseRating + (rating - baseRating) * progress)
        data.push({
          month,
          rating: monthRating,
          maxRating: Math.max(maxRating, monthRating + Math.round(Math.random() * 100))
        })
      })
      return data
    }

    const ratingData = generateRatingData()

    // Generate solved problems trend
    const generateSolvedTrend = (): Array<{ month: string; solved: number }> => {
      const data: Array<{ month: string; solved: number }> = []
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const baseSolved = Math.max(0, totalSolved - 150)
      
      months.forEach((month, index) => {
        const progress = (index + 1) / months.length
        const solved = Math.round(baseSolved + (totalSolved - baseSolved) * progress)
        data.push({
          month,
          solved
        })
      })
      return data
    }

    const solvedTrend = generateSolvedTrend()

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-dark-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Rating</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {rating || '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-dark-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Max Rating</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {maxRating || '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-dark-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Total Solved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalSolved || '—'}
            </p>
          </div>
        </div>

        {/* Rating Progression Chart */}
        {rating > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              Rating Progression
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ratingData}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRating)"
                  />
                  <Line
                    type="monotone"
                    dataKey="maxRating"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Current Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Max Rating</span>
              </div>
            </div>
          </div>
        )}

        {/* Solved Problems Trend */}
        {totalSolved > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={16} />
              Problems Solved Trend
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solvedTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="solved" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    )
  }

  // LeetCode view
  if (platform === 'leetcode') {
    const easySolved = stats.easySolved ?? 0
    const mediumSolved = stats.mediumSolved ?? 0
    const hardSolved = stats.hardSolved ?? 0
    const totalSolved = stats.totalSolved ?? 0

    const difficultyData = [
      { name: 'Easy', value: easySolved, fill: '#22c55e' },
      { name: 'Medium', value: mediumSolved, fill: '#eab308' },
      { name: 'Hard', value: hardSolved, fill: '#ef4444' }
    ].filter(item => item.value > 0)

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Total Solved</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {totalSolved}
          </p>
          {totalSolved > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{easySolved}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Easy</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{mediumSolved}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Medium</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{hardSolved}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hard</p>
              </div>
            </div>
          )}
        </div>

        {/* Difficulty Distribution Chart */}
        {difficultyData.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Difficulty Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
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
          </div>
        )}

        {/* Solved Problems Trend */}
        {totalSolved > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              Problems Solved Over Time
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(() => {
                  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const baseSolved = Math.max(0, totalSolved - 80)
                  return months.map((month, index) => {
                    const progress = (index + 1) / months.length
                    return {
                      month,
                      solved: Math.round(baseSolved + (totalSolved - baseSolved) * progress)
                    }
                  })
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="solved"
                    stroke="#eab308"
                    strokeWidth={3}
                    dot={{ fill: '#eab308', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rating Display (if available) */}
        {stats.rating && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Contest Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.rating}
                </p>
              </div>
              {stats.maxRating && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Max Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.maxRating}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // HackerRank view
  if (platform === 'hackerrank') {
    const badges = stats.badges || []
    const topBadges = badges.slice(0, 6)

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Total Solved</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {stats.totalSolved ?? '—'}
          </p>
        </div>

        {/* Badges Visualization */}
        {badges.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award size={16} />
                Badges ({badges.length})
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {topBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-dark-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-600"
                >
                  <Award size={16} className="text-yellow-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {badge.level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Badge Level Distribution Chart */}
            {badges.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Badge Levels Distribution
                </h5>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const levelCounts: Record<string, number> = {}
                      badges.forEach(badge => {
                        levelCounts[badge.level] = (levelCounts[badge.level] || 0) + 1
                      })
                      return Object.entries(levelCounts).map(([level, count]) => ({
                        level,
                        count
                      }))
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="level" 
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Solved Problems Trend */}
        {stats.totalSolved && stats.totalSolved > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={16} />
              Problems Solved Over Time
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(() => {
                  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const totalSolved = stats.totalSolved ?? 0
                  const baseSolved = Math.max(0, totalSolved - 30)
                  return months.map((month, index) => {
                    const progress = (index + 1) / months.length
                    return {
                      month,
                      solved: Math.round(baseSolved + (totalSolved - baseSolved) * progress)
                    }
                  })
                })()}>
                  <defs>
                    <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="solved"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorSolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

// Main Component
const CodingPlatformsTab: React.FC = () => {
  const [summary, setSummary] = useState<ProfileSummary | null>(null)
  const [platforms, setPlatforms] = useState<CodingProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(new Set())
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [syncingPlatforms, setSyncingPlatforms] = useState<Set<Platform>>(new Set())
  const [linkingPlatforms, setLinkingPlatforms] = useState<Set<Platform>>(new Set())

  const allPlatforms: Platform[] = ['codeforces', 'leetcode', 'hackerrank']

  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<SummaryResponse>('/coding-profiles/summary')
      if (response.data.success) {
        console.log('📊 Profile Summary Response:', {
          summary: response.data.summary,
          platformsCount: response.data.platforms?.length || 0,
          platforms: response.data.platforms
        })
        
        setSummary(response.data.summary)
        setPlatforms(response.data.platforms || [])
        
        // Auto-select first connected platform
        if (!selectedPlatform && response.data.platforms && response.data.platforms.length > 0) {
          setSelectedPlatform(response.data.platforms[0].platform)
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile summary:', err)
      setError(err.response?.data?.message || 'Failed to load coding profiles')
      toast.error(err.response?.data?.message || 'Failed to load coding profiles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const handleSync = async (platform: Platform) => {
    setSyncingPlatforms(prev => new Set(prev).add(platform))
    
    try {
      const response = await api.post('/coding-profiles/sync', { platform })
      if (response.data.success) {
        toast.success(`${getPlatformName(platform)} profile synced successfully!`)
        await fetchSummary()
      }
    } catch (err: any) {
      console.error('Error syncing profile:', err)
      toast.error(err.response?.data?.message || 'Failed to sync profile')
    } finally {
      setSyncingPlatforms(prev => {
        const next = new Set(prev)
        next.delete(platform)
        return next
      })
    }
  }

  const handleUnlink = async (platform: Platform) => {
    if (!window.confirm(`Are you sure you want to unlink your ${getPlatformName(platform)} profile?`)) {
      return
    }

    try {
      const response = await api.delete('/coding-profiles', { data: { platform } })
      if (response.data.success) {
        toast.success(`${getPlatformName(platform)} profile unlinked successfully`)
        
        // Clear selection if unlinking the selected platform
        if (selectedPlatform === platform) {
          setSelectedPlatform(null)
        }
        
        // Refresh summary to get updated data (or demo data if no profiles remain)
        await fetchSummary()
      }
    } catch (err: any) {
      console.error('Error unlinking profile:', err)
      toast.error(err.response?.data?.message || 'Failed to unlink profile')
    }
  }

  const handleLink = async (platform: Platform, input: string) => {
    setLinkingPlatforms(prev => new Set(prev).add(platform))
    
    try {
      const response = await api.post('/coding-profiles/link', { platform, input })
      if (response.data.success) {
        toast.success(`${getPlatformName(platform)} profile linked successfully!`)
        await fetchSummary()
        setSelectedPlatform(platform)
        setExpandedPlatforms(prev => {
          const next = new Set(prev)
          next.delete(platform)
          return next
        })
      }
    } catch (err: any) {
      console.error('Error linking profile:', err)
      toast.error(err.response?.data?.message || 'Failed to link profile')
    } finally {
      setLinkingPlatforms(prev => {
        const next = new Set(prev)
        next.delete(platform)
        return next
      })
    }
  }

  const togglePlatform = (platform: Platform) => {
    setExpandedPlatforms(prev => {
      const next = new Set(prev)
      if (next.has(platform)) {
        next.delete(platform)
      } else {
        next.add(platform)
      }
      return next
    })
  }

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
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar */}
            <div className="w-full lg:w-80 space-y-4">
              {/* Summary Stats */}
              <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-dark-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Overview
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-yellow-500" size={16} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total Solved</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {summary.totalSolved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="text-blue-500" size={16} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Platforms</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {summary.platformsConnected} / 3
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="text-gray-500" size={16} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Last Synced</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatTimeAgo(summary.lastSyncedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Solving Stats Section */}
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
                <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Problem Solving Stats
                  </h4>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-dark-700">
                  {allPlatforms.map((platform) => {
                    const profile = platforms.find(p => p.platform === platform)
                    return (
                      <PlatformListItem
                        key={platform}
                        platform={platform}
                        profile={profile || null}
                        isExpanded={expandedPlatforms.has(platform)}
                        isSelected={selectedPlatform === platform}
                        onToggle={() => togglePlatform(platform)}
                        onSelect={() => setSelectedPlatform(platform)}
                        onSync={() => handleSync(platform)}
                        onUnlink={() => handleUnlink(platform)}
                        isSyncing={syncingPlatforms.has(platform)}
                        onLink={(input) => handleLink(platform, input)}
                        isLinking={linkingPlatforms.has(platform)}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {selectedPlatform ? (
                <PlatformDetailsView
                  profile={platforms.find(p => p.platform === selectedPlatform) || null}
                  platform={selectedPlatform}
                />
              ) : (
                <div className="bg-white dark:bg-dark-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-dark-700 text-center">
                  <Code2 size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Select a platform from the sidebar to view detailed stats
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
