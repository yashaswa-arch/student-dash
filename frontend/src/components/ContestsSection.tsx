import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { contestAPI, Contest } from '../api/services'
import { normalizePlatform } from '../utils/contestUtils'
const PLATFORM_LOGOS = {
  CODEFORCES: '/platforms/codeforces.webp',
  LEETCODE: '/platforms/leetcode.webp',
  ATCODER: '/platforms/atcoder.webp',
} as const

// Debug: Log logo imports
console.log('Logo imports:', {
  CODEFORCES: PLATFORM_LOGOS.CODEFORCES,
  LEETCODE: PLATFORM_LOGOS.LEETCODE,
  ATCODER: PLATFORM_LOGOS.ATCODER,
})

const ContestsSection: React.FC = () => {
  const navigate = useNavigate()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await contestAPI.getUpcomingContests(
          5,
          ['CODEFORCES', 'CODECHEF', 'ATCODER', 'LEETCODE']
        )
        setContests(data)
      } catch (err: any) {
        console.error('Error fetching contests:', err)
        const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Could not load contests. Please check if the backend is running.'
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchContests()
  }, [])

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      CODEFORCES: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      CODECHEF: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      ATCODER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      LEETCODE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      HACKERRANK: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
    }
    return colors[platform] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `${day} ${month}, ${time}`
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}min`
  }

  // Calculate last updated time from contests
  const lastUpdated = useMemo(() => {
    const lastSyncedDates = contests
      .map(c => c.lastSyncedAt)
      .filter((date): date is string => date !== null && date !== undefined)
      .map(date => new Date(date).getTime())
    
    if (lastSyncedDates.length === 0) return null
    
    const mostRecent = new Date(Math.max(...lastSyncedDates))
    const now = new Date()
    const diffMs = now.getTime() - mostRecent.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return mostRecent.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }, [contests])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Upcoming Contests
        </h3>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <RefreshCw size={12} />
            <span>Updated {lastUpdated}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : contests.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Calendar className="mx-auto mb-2 opacity-50" size={32} />
          <p className="text-sm">No upcoming contests in the next few days.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {contests.map((contest) => {
            console.log("Contest platform:", contest.platform);
            return (
            <motion.div
              key={contest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-dark-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {(() => {
                      const normalizedPlatform = normalizePlatform(contest.platform)
                      const logoSrc = PLATFORM_LOGOS[normalizedPlatform as keyof typeof PLATFORM_LOGOS]
                      console.log('Rendering logo:', { 
                        normalizedPlatform, 
                        logoSrc, 
                        hasLogoSrc: !!logoSrc,
                        fullUrl: logoSrc ? `${window.location.origin}${logoSrc}` : null
                      })
                      return logoSrc ? (
                        <img 
                          src={logoSrc} 
                          alt={normalizedPlatform} 
                          title={normalizedPlatform}
                          className="w-6 h-6 object-contain flex-shrink-0 dark:brightness-110 dark:contrast-110"
                          style={{ display: 'block', minWidth: '24px', minHeight: '24px', visibility: 'visible' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            console.error('Image failed to load:', {
                              logoSrc,
                              attemptedUrl: target.src,
                              error: e
                            })
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', logoSrc)
                          }}
                        />
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 dark:bg-slate-600 text-slate-100 dark:text-slate-200">
                          {normalizedPlatform}
                        </span>
                      )
                    })()}
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {contest.name}
                    </h4>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{formatDate(contest.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{formatDuration(contest.durationMinutes)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // TODO: Implement .ics calendar file generation
                      console.log('Add to calendar - TODO')
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                    title="Add to Calendar"
                  >
                    <Calendar size={16} />
                  </button>
                  <a
                    href={contest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    View
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
            )
          })}
        </div>
      )}

      {/* View All Contests Link */}
      <div className="border-t border-gray-200 dark:border-dark-700 pt-4">
        <button
          onClick={() => navigate('/contests')}
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          View all contests
        </button>
      </div>
    </div>
  )
}

export default ContestsSection

