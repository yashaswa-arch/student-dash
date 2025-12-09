import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ExternalLink, ChevronLeft, ChevronRight, Loader2, AlertCircle, X, RefreshCw } from 'lucide-react'
import { FiCalendar, FiClock, FiExternalLink } from 'react-icons/fi'
import { contestAPI, Contest } from '../api/services'
import { normalizePlatform } from '../utils/contestUtils'
import { createIcsForContest } from '../utils/calendarUtils'
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

const ContestsPage: React.FC = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['CODEFORCES', 'ATCODER', 'LEETCODE'])
  const [timeframe, setTimeframe] = useState<'this-month' | 'next-30-days'>('this-month')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([])
  const [calendarContests, setCalendarContests] = useState<Contest[]>([])
  
  const [listLoading, setListLoading] = useState(true)
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  
  const [hoveredContest, setHoveredContest] = useState<Contest | null>(null)
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null)

  // Calculate date range for calendar
  const { fromDate, toDate } = useMemo(() => {
    if (timeframe === 'next-30-days') {
      const from = new Date()
      const to = new Date()
      to.setDate(to.getDate() + 30)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      return { fromDate: from, toDate: to }
    } else {
      // This month
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      
      const from = new Date(year, month, 1)
      const to = new Date(year, month + 1, 0) // Last day of month
      
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      
      return { fromDate: from, toDate: to }
    }
  }, [currentMonth, timeframe])

  // Fetch upcoming contests for list
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setListLoading(true)
        setListError(null)
        const data = await contestAPI.getUpcomingContests(20, selectedPlatforms)
        setUpcomingContests(data || [])
      } catch (err: any) {
        console.error('Error fetching upcoming contests:', err)
        const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Could not load upcoming contests. Please check if the backend is running.'
        setListError(errorMsg)
        setUpcomingContests([]) // Set empty array on error
      } finally {
        setListLoading(false)
      }
    }

    fetchUpcoming()
  }, [selectedPlatforms])

  // Fetch calendar contests
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setCalendarLoading(true)
        setCalendarError(null)
        
        const from = fromDate.toISOString().split('T')[0]
        const to = toDate.toISOString().split('T')[0]
        
        const data = await contestAPI.getCalendarContests(from, to, selectedPlatforms)
        setCalendarContests(data || [])
      } catch (err: any) {
        console.error('Error fetching calendar contests:', err)
        const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Could not load calendar contests. Please check if the backend is running.'
        setCalendarError(errorMsg)
        setCalendarContests([]) // Set empty array on error so calendar still renders
      } finally {
        setCalendarLoading(false)
      }
    }

    if (fromDate && toDate) {
      fetchCalendar()
    }
  }, [fromDate, toDate, selectedPlatforms])

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      CODEFORCES: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 dark:border-orange-500/40',
      CODECHEF: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      ATCODER: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/40',
      LEETCODE: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 dark:border-yellow-500/40',
      HACKERRANK: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
    }
    return colors[platform] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'FINISHED':
        return 'opacity-50 grayscale'
      default:
        return ''
    }
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

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const handleAddToCalendar = (contest: Contest) => {
    try {
      const icsContent = createIcsForContest({
        name: contest.name,
        url: contest.url,
        startTime: contest.startTime,
        endTime: contest.endTime
      })

      // Sanitize filename: remove special characters, keep alphanumeric, spaces, hyphens, underscores
      const sanitizedName = contest.name
        .replace(/[^a-zA-Z0-9\s\-_]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .substring(0, 50) // Limit length
      
      const platform = normalizePlatform(contest.platform).toLowerCase()
      const filename = `${platform}-${sanitizedName}.ics`

      // Create blob and trigger download
      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error creating calendar file:', error)
    }
  }

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: Array<{ date: Date; contests: Contest[] }> = []
    
    // Add empty cells for days before month starts (previous month's trailing days)
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({ date, contests: [] })
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      
      // Find contests for this date
      const contestsForDay = calendarContests.filter(contest => {
        const contestDate = new Date(contest.startTime).toISOString().split('T')[0]
        return contestDate === dateStr
      })
      
      days.push({ date, contests: contestsForDay })
    }
    
    // Add empty cells for days after month ends (next month's leading days)
    const totalCells = days.length
    const remainingCells = 42 - totalCells // 6 weeks * 7 days = 42
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, contests: [] })
    }
    
    return days
  }, [currentMonth, calendarContests])

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Find the next upcoming contest (earliest startTime in the future)
  const nextContest = useMemo(() => {
    const now = new Date()
    const futureContests = upcomingContests.filter(contest => {
      const startTime = new Date(contest.startTime)
      return startTime > now
    })
    
    if (futureContests.length === 0) return null
    
    // Sort by startTime ascending and return the first one
    return futureContests.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )[0]
  }, [upcomingContests])

  // Calculate last updated time from all contests
  const lastUpdatedText = useMemo(() => {
    const allContests = [...upcomingContests, ...calendarContests]
    const lastSyncedDates = allContests
      .map(c => c.lastSyncedAt)
      .filter((date): date is string => date !== null && date !== undefined)
      .map(date => new Date(date).getTime())
    
    if (lastSyncedDates.length === 0) return null
    
    const mostRecentSync = new Date(Math.max(...lastSyncedDates))
    const now = new Date()
    const diffMs = now.getTime() - mostRecentSync.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return mostRecentSync.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: mostRecentSync.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }, [upcomingContests, calendarContests])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Contest Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and track upcoming coding contests
            </p>
          </div>
          {/* Last Updated Label */}
          {lastUpdatedText && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <RefreshCw size={14} />
              <span>Last updated: {lastUpdatedText}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Platform Filters */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Platforms
              </label>
              <div className="flex flex-wrap gap-3">
                {['CODEFORCES', 'ATCODER', 'LEETCODE'].map(platform => {
                  const normalizedPlatform = normalizePlatform(platform)
                  const logoSrc = PLATFORM_LOGOS[normalizedPlatform as keyof typeof PLATFORM_LOGOS]
                  const isSelected = selectedPlatforms.includes(platform)
                  
                  // Format platform name for display
                  const displayName = platform === 'CODEFORCES' ? 'Codeforces' 
                    : platform === 'ATCODER' ? 'AtCoder'
                    : platform === 'LEETCODE' ? 'LeetCode'
                    : platform
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => handlePlatformToggle(platform)}
                      className={`flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 transition-all hover:scale-105 min-w-[80px] ${
                        isSelected
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 opacity-50 hover:opacity-75'
                      }`}
                      title={platform}
                    >
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={platform}
                          className="object-contain dark:brightness-110 dark:contrast-110"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                            maxWidth: '24px',
                            maxHeight: '24px',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {platform.substring(0, 3)}
                        </span>
                      )}
                      <span className={`text-xs font-medium ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {displayName}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Timeframe Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Timeframe
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeframe('this-month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === 'this-month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  This month
                </button>
                <button
                  onClick={() => setTimeframe('next-30-days')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === 'next-30-days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  Next 30 days
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: List + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Left: Upcoming Contests List */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700 w-full lg:col-span-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Upcoming Contests
            </h2>

            {listLoading ? (
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
            ) : listError ? (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle size={18} />
                  <p className="text-sm">{listError}</p>
                </div>
              </div>
            ) : upcomingContests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm">No upcoming contests found.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {upcomingContests.map((contest) => {
                  console.log("Contest platform:", contest.platform);
                  const isNextContest = nextContest && contest.id === nextContest.id
                  return (
                  <motion.div
                    key={contest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative bg-gradient-to-br from-white to-gray-50 dark:from-dark-800 dark:to-dark-900 rounded-xl p-5 border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${getStatusColor(contest.status)} ${
                      isNextContest
                        ? 'border-l-4 border-l-blue-500 dark:border-l-blue-400 border-t border-r border-b border-gray-200 dark:border-dark-700'
                        : 'border border-gray-200 dark:border-dark-700'
                    }`}
                    style={{ minHeight: 'fit-content' }}
                  >
                    {/* Next Contest Badge */}
                    {isNextContest && (
                      <div className="absolute -top-2 -left-2 bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                        Next
                      </div>
                    )}
                    {/* Contest Name with Platform Logo */}
                    <div className="flex items-center gap-2.5 mb-4">
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
                            style={{ 
                              display: 'block', 
                              width: '24px', 
                              height: '24px',
                              objectFit: 'contain',
                              maxWidth: '24px',
                              maxHeight: '24px'
                            }}
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
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 dark:bg-slate-600 text-slate-100 dark:text-slate-200 flex-shrink-0">
                            {normalizedPlatform}
                          </span>
                        )
                      })()}
                      <h4 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 flex-1 min-w-0">
                        {contest.name}
                      </h4>
                    </div>

                    {/* Date and Duration Row */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">{formatDate(contest.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                        <span>{formatDuration(contest.durationMinutes)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end items-center gap-2 mt-5">
                      <button
                        onClick={() => handleAddToCalendar(contest)}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                        title="Add to Calendar"
                      >
                        <FiCalendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Add to Calendar</span>
                      </button>
                      <a
                        href={contest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        View
                        <FiExternalLink className="w-4 h-4 flex-shrink-0" />
                      </a>
                    </div>
                  </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Calendar */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700 w-full lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {monthName}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {calendarLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading calendar...</span>
                </div>
                {/* Show skeleton calendar while loading */}
                <div className="relative opacity-50 pointer-events-none">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="min-h-[80px] p-1 border border-gray-200 dark:border-dark-600 rounded bg-gray-50 dark:bg-dark-700"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                {calendarError && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800 mb-4">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle size={16} />
                      <p className="text-xs">{calendarError}</p>
                    </div>
                  </div>
                )}
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayData, index) => {
                    const isCurrentMonth = dayData.date.getMonth() === currentMonth.getMonth()
                    const isToday =
                      dayData.date.toDateString() === new Date().toDateString()
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] p-1 border rounded transition-all ${
                          isToday
                            ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : isCurrentMonth
                            ? 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800'
                            : 'border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900 opacity-50'
                        }`}
                      >
                        <div
                          className={`text-xs font-medium mb-1 ${
                            isCurrentMonth
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-gray-600'
                          } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}
                        >
                          {dayData.date.getDate()}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                          {dayData.contests.slice(0, 2).map((contest) => {
                            const normalizedPlatform = normalizePlatform(contest.platform)
                            const logoSrc = PLATFORM_LOGOS[normalizedPlatform as keyof typeof PLATFORM_LOGOS]
                            return (
                              <div
                                key={contest.id}
                                className="flex items-center justify-center rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onMouseEnter={(e) => {
                                  setHoveredContest(contest)
                                  setHoveredPosition({ x: e.clientX, y: e.clientY })
                                }}
                                onMouseLeave={() => {
                                  setHoveredContest(null)
                                  setHoveredPosition(null)
                                }}
                                onClick={() => window.open(contest.url, '_blank')}
                                title={contest.name}
                              >
                                {logoSrc ? (
                                  <img 
                                    src={logoSrc} 
                                    alt={normalizedPlatform} 
                                    className="object-contain dark:brightness-110 dark:contrast-110"
                                    style={{ 
                                      width: '16px', 
                                      height: '16px',
                                      objectFit: 'contain',
                                      maxWidth: '16px',
                                      maxHeight: '16px',
                                      display: 'block'
                                    }}
                                  />
                                ) : (
                                  <span className="text-[10px] px-1 py-0.5 rounded bg-slate-700 dark:bg-slate-600 text-slate-100 dark:text-slate-200">
                                    {normalizedPlatform.substring(0, 3)}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                          {dayData.contests.length > 2 && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                              +{dayData.contests.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Tooltip/Popover */}
                <AnimatePresence>
                  {hoveredContest && hoveredPosition && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 p-4 max-w-xs"
                      style={{
                        left: `${hoveredPosition.x + 10}px`,
                        top: `${hoveredPosition.y + 10}px`,
                        pointerEvents: 'none'
                      }}
                      onMouseEnter={() => {}}
                      onMouseLeave={() => {
                        setHoveredContest(null)
                        setHoveredPosition(null)
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {hoveredContest.name}
                        </h4>
                        <button
                          onClick={() => {
                            setHoveredContest(null)
                            setHoveredPosition(null)
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium border mb-2 ${getPlatformColor(normalizePlatform(hoveredContest.platform))}`}
                      >
                        {normalizePlatform(hoveredContest.platform)}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>Start: {formatDate(hoveredContest.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>End: {formatDate(hoveredContest.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>Duration: {formatDuration(hoveredContest.durationMinutes)}</span>
                        </div>
                      </div>
                      <a
                        href={hoveredContest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        View Contest
                        <ExternalLink size={12} />
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestsPage

