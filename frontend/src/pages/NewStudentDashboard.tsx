import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { logoutUser } from '../store/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchStudentOverview } from '../services/studentOverview'
import { useStudentSocket } from '../hooks/useStudentSocket'
import { useDebounce } from '../hooks/useDebounce'
import { 
  Code2, 
  TrendingUp, 
  Target, 
  Calendar,
  Github,
  Activity,
  CheckCircle2,
  Flame,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Clock,
  CalendarDays,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import SlideOver from '../components/SlideOver'
import { HoverButton } from '../components/ui/hover-glow-button'
import '../styles/dashboard.css'

// Lazy-load heavy components
const GitHubStatsSection = lazy(() => import('../components/GitHubStatsSection'))
const ContestsSection = lazy(() => import('../components/ContestsSection'))

interface NewStudentDashboardProps {
  onClickCard?: (type: string) => void
}

const NewStudentDashboard: React.FC<NewStudentDashboardProps> = ({ onClickCard }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const [activeTab, setActiveTab] = useState<'practice' | 'analytics' | 'contests' | 'github'>('practice')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isActivityExpanded, setIsActivityExpanded] = useState(false)
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [slideOverType, setSlideOverType] = useState<'solved' | 'streak' | 'efficiency' | 'upcoming' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // WebSocket connection
  const { events: socketEvents, connected: socketConnected } = useStudentSocket()

  // Overview state
  const [overview, setOverview] = useState({
    totalProblemsSolved: 0,
    currentStreak: 0,
    practiceMinutesToday: 0,
    nextEvent: {
      name: 'No upcoming events',
      date: null,
      time: null
    },
    recentSubmissions: [] as any[]
  })

  // Real user stats - starts at 0 until user makes progress
  const [stats] = useState({
    totalSolved: 0,
    currentStreak: 0,
    maxStreak: 0,
    aiAnalysis: 0,
    contestRating: 0,
    accuracy: 0
  })

  // Fetch overview data on mount
  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true)
        const data = await fetchStudentOverview()
        
        // Map API response to overview state
        setOverview({
          totalProblemsSolved: data.totalSolved || 0,
          currentStreak: data.currentStreakDays || 0,
          practiceMinutesToday: data.practiceMinutesToday || 0,
          nextEvent: data.upcomingInterview 
            ? {
                name: data.upcomingInterview.name || data.upcomingInterview.company || 'Upcoming Interview',
                date: data.upcomingInterview.date || data.upcomingInterview.scheduledDate || null,
                time: data.upcomingInterview.time || data.upcomingInterview.scheduledTime || null
              }
            : {
                name: 'No upcoming events',
                date: null,
                time: null
              },
          recentSubmissions: data.recentSubmissions || []
        })
      } catch (error) {
        console.error('Error loading overview:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOverview()
  }, [])

  // Track processed events to avoid duplicates
  const processedEventsRef = useRef<Set<string>>(new Set())
  
  // Track newly added submissions for highlight animation
  const [newSubmissionIds, setNewSubmissionIds] = useState<Set<string>>(new Set())
  const previousSubmissionsLengthRef = useRef(0)

  // Handle WebSocket events
  useEffect(() => {
    // Process only new events (those not in processedEventsRef)
    socketEvents.forEach(event => {
      // Create a unique key for this event (use timestamp + type, or generate ID)
      const eventKey = event.timestamp 
        ? `${event.type}-${event.timestamp}` 
        : `${event.type}-${Date.now()}-${Math.random()}`
      
      // Skip if already processed
      if (processedEventsRef.current.has(eventKey)) {
        return
      }

      // Only process events that have a type and are not system events
      if (!event.type || event.type === 'connection' || event.type === 'disconnection' || event.type === 'error') {
        processedEventsRef.current.add(eventKey)
        return
      }

      // Mark as processed
      processedEventsRef.current.add(eventKey)

      switch (event.type) {
        case 'submission':
          setOverview(prev => {
            const newOverview = { ...prev }
            
            // Increment totalSolved if status is 'AC' (Accepted)
            if (event.status === 'AC' || event.status === 'Accepted') {
              newOverview.totalProblemsSolved = (prev.totalProblemsSolved || 0) + 1
            }
            
            // Prepend to recentSubmissions (newest first)
            if (event.payload || event) {
              const submission = event.payload || event
              newOverview.recentSubmissions = [
                submission,
                ...(prev.recentSubmissions || [])
              ].slice(0, 50) // Keep last 50 submissions
            }
            
            return newOverview
          })
          break

        case 'practice':
          setOverview(prev => ({
            ...prev,
            practiceMinutesToday: event.payload?.totalToday || event.totalToday || 0
          }))
          break

        case 'interview':
          setOverview(prev => ({
            ...prev,
            nextEvent: event.payload || event.upcomingInterview 
              ? {
                  name: (event.payload?.name || event.upcomingInterview?.name || event.payload?.company || event.upcomingInterview?.company) || 'Upcoming Interview',
                  date: event.payload?.date || event.upcomingInterview?.date || event.payload?.scheduledDate || event.upcomingInterview?.scheduledDate || null,
                  time: event.payload?.time || event.upcomingInterview?.time || event.payload?.scheduledTime || event.upcomingInterview?.scheduledTime || null
                }
              : prev.nextEvent
          }))
          break

        default:
          // Ignore other event types
          break
      }
    })

    // Clean up old processed events (keep only last 100)
    if (processedEventsRef.current.size > 100) {
      const entries = Array.from(processedEventsRef.current)
      processedEventsRef.current = new Set(entries.slice(-50))
    }
  }, [socketEvents])

  // Format timestamp to human-readable format
  const formatTimeAgo = useCallback((dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown'
    
    try {
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
    } catch (e) {
      return 'Unknown'
    }
  }, [])

  // Get status badge color
  const getStatusColor = useCallback((status: string): string => {
    const normalizedStatus = status?.toUpperCase() || ''
    if (normalizedStatus === 'AC' || normalizedStatus === 'ACCEPTED' || normalizedStatus === 'PASSED') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
    if (normalizedStatus === 'WA' || normalizedStatus === 'WRONG ANSWER' || normalizedStatus === 'FAILED') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    if (normalizedStatus === 'TLE' || normalizedStatus === 'TIME LIMIT EXCEEDED') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }, [])

  // Track new submissions for highlight animation
  useEffect(() => {
    const currentLength = overview.recentSubmissions?.length || 0
    const previousLength = previousSubmissionsLengthRef.current
    
    if (currentLength > previousLength) {
      // New submissions added - mark them for highlighting
      const newSubmissions = overview.recentSubmissions?.slice(0, currentLength - previousLength) || []
      const newIds = new Set(newSubmissions.map((s: any) => s._id || s.id || `${s.timestamp}-${Math.random()}`))
      setNewSubmissionIds(newIds)
      
      // Remove highlight after animation (2 seconds)
      setTimeout(() => {
        setNewSubmissionIds(new Set())
      }, 2000)
    }
    
    previousSubmissionsLengthRef.current = currentLength
  }, [overview.recentSubmissions])

  // Handle debounced search query
  useEffect(() => {
    if (debouncedSearchQuery) {
      // Perform search operation here
      // For now, just log it - can be extended to filter/search functionality
      console.log('Searching for:', debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  // Handle card click
  const handleCardClick = (type: string) => {
    // Map card types to slide-over types
    const typeMap: Record<string, 'solved' | 'streak' | 'efficiency' | 'upcoming'> = {
      'totalProblemsSolved': 'solved',
      'currentStreak': 'streak',
      'practiceMinutesToday': 'efficiency',
      'nextEvent': 'upcoming'
    }

    const slideOverType = typeMap[type]
    if (slideOverType) {
      setSlideOverType(slideOverType)
      setSlideOverOpen(true)
    }

    if (onClickCard) {
      onClickCard(type)
    }
  }

  // Close slide-over
  const handleCloseSlideOver = () => {
    setSlideOverOpen(false)
    setTimeout(() => setSlideOverType(null), 300) // Wait for animation to complete
  }

  // Generate mock streak history (last 14 days)
  const getStreakHistory = () => {
    const history = []
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      history.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        solved: i < overview.currentStreak ? Math.floor(Math.random() * 3) + 1 : 0
      })
    }
    return history
  }

  // Generate mock practice sessions (today + last 7 days)
  const getPracticeSessions = () => {
    const sessions = []
    const today = new Date()
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const isToday = i === 0
      sessions.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: isToday ? overview.practiceMinutesToday : Math.floor(Math.random() * 120) + 10,
        sessions: Math.floor(Math.random() * 5) + 1
      })
    }
    return sessions
  }

  // Get solved problems (from recentSubmissions filtered by AC status)
  const getSolvedProblems = () => {
    if (!overview.recentSubmissions) return []
    return overview.recentSubmissions.filter((s: any) => {
      const status = s.status || s.result || ''
      return status.toUpperCase() === 'AC' || status.toUpperCase() === 'ACCEPTED' || status.toUpperCase() === 'PASSED'
    })
  }

  // Generate last 365 days of activity data - all empty initially
  const generateActivityData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // No activity initially - will be populated from backend
      data.push({
        date: date.toISOString().split('T')[0],
        count: 0,
        level: 0
      })
    }
    return data
  }

  const [activityData] = useState(generateActivityData())

  // Get color based on activity level
  const getActivityColor = (level: number) => {
    const colors = [
      'bg-gray-200 dark:bg-gray-700', // 0 - no activity
      'bg-green-200 dark:bg-green-900', // 1 - low
      'bg-green-400 dark:bg-green-700', // 2 - medium
      'bg-green-600 dark:bg-green-500', // 3 - high
      'bg-green-800 dark:bg-green-400'  // 4 - very high
    ]
    return colors[level]
  }

  // Group activity by weeks
  const getWeeksData = () => {
    const weeks = []
    for (let i = 0; i < activityData.length; i += 7) {
      weeks.push(activityData.slice(i, i + 7))
    }
    return weeks
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser())
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Force logout even if API fails
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <div className="dashboard-scope min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Top Navigation Bar */}
      <nav className="shadow-md border-b sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
                <Code2 className="text-[var(--accent)]" size={24} />
              </div>
              <span className="ml-3 text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                CodeMaster
              </span>
            </div>

            {/* Center - Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search problems, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search problems and topics"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    backgroundColor: 'var(--surface-light)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Right Side - Actions & Profile */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button 
                aria-label="View notifications"
                className="p-2 rounded-lg relative focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  color: 'var(--text-muted)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.backgroundColor = 'var(--surface-light)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Bell size={22} aria-hidden="true" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-label="Unread notifications"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  aria-label="Open user profile menu"
                  aria-expanded={showProfileDropdown}
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-light)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, var(--accent), #60a5fa)' }}>
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden backdrop-blur-sm"
                      style={{ 
                        backgroundColor: 'var(--surface)', 
                        borderColor: 'rgba(255,255,255,0.1)'
                      }}
                    >
                      {/* Profile Header */}
                      <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, var(--accent), #60a5fa)' }}>
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                              {user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {user?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-light)' }}>
                            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalSolved}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Solved</p>
                          </div>
                          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-light)' }}>
                            <p className="text-lg font-bold" style={{ color: '#fb923c' }}>{stats.currentStreak}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Streak</p>
                          </div>
                          <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-light)' }}>
                            <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{stats.contestRating}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rating</p>
                          </div>
                        </div>
                      </div>

                      {/* Activity Heatmap */}
                      <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Activity in the last year
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {activityData.filter(d => d.count > 0).length > 0 
                              ? `${activityData.filter(d => d.count > 0).length} active days`
                              : 'No activity yet'}
                          </p>
                        </div>
                        
                        {/* Heatmap Grid */}
                        <div className="overflow-x-auto">
                          {activityData.filter(d => d.count > 0).length === 0 ? (
                            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                              <Activity className="mx-auto mb-2 opacity-50" size={32} />
                              <p className="text-sm">Start coding to see your activity here</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-1">
                                {getWeeksData().map((week, weekIndex) => (
                                  <div key={weekIndex} className="flex flex-col gap-1">
                                    {week.map((day, dayIndex) => (
                                      <div
                                        key={dayIndex}
                                        className={`w-2.5 h-2.5 rounded-sm ${getActivityColor(day.level)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
                                        title={`${day.date}: ${day.count} contributions`}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </div>
                              
                              {/* Legend */}
                              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <span>Less</span>
                                <div className="flex gap-1">
                                  {[0, 1, 2, 3, 4].map(level => (
                                    <div
                                      key={level}
                                      className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
                                    />
                                  ))}
                                </div>
                                <span>More</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            navigate('/profile')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                          style={{ color: 'var(--text-primary)', backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-light)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <User size={18} />
                          <span className="text-sm">View Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            // Navigate to settings
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                          style={{ color: 'var(--text-primary)', backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-light)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <Settings size={18} />
                          <span className="text-sm">Settings</span>
                        </button>

                        <div className="border-t my-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                          style={{ color: '#ef4444', backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <LogOut size={18} />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header - Moved below nav */}
      <div className="shadow-sm border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                Skill Analytics
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Analyze your coding progress with data-driven insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-[12px] p-3 shadow-lg border"
                  style={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 rounded w-24 mb-3 animate-pulse" style={{ backgroundColor: 'var(--surface-light)' }}></div>
                      <div className="h-8 rounded w-16 mb-4 animate-pulse" style={{ backgroundColor: 'var(--surface-light)' }}></div>
                    </div>
                    <div className="w-12 h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--surface-light)' }}></div>
                  </div>
                  <div className="mt-4 h-4 rounded w-32 animate-pulse" style={{ backgroundColor: 'var(--surface-light)' }}></div>
                </motion.div>
              ))}
            </>
          ) : (
            <>
              {/* Total Problems Solved */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleCardClick('totalProblemsSolved')}
                aria-label="View total problems solved details"
                className="rounded-[12px] p-3 shadow-lg border cursor-pointer hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-kpi-subtitle">Total Problems Solved</p>
                    <p className="dashboard-kpi-number">{overview.totalProblemsSolved}</p>
                  </div>
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
                    <CheckCircle2 className="text-[var(--accent)]" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm" style={{ color: '#22c55e' }}>
                  <TrendingUp size={16} className="mr-1" />
                  {overview.totalProblemsSolved > 0 ? '+12 this week' : 'Start practicing to see progress'}
                </div>
              </motion.div>

              {/* Current Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleCardClick('currentStreak')}
                aria-label="View current streak details"
                className="rounded-[12px] p-3 shadow-lg border cursor-pointer hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fb923c'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-kpi-subtitle">Current Streak</p>
                    <p className="dashboard-kpi-number">{overview.currentStreak} days</p>
                  </div>
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 146, 60, 0.12)' }}>
                    <Flame className="text-[#fb923c]" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {stats.maxStreak > 0 ? `Max: ${stats.maxStreak} days` : 'No streak yet'}
                </div>
              </motion.div>

              {/* Practice Minutes Today */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleCardClick('practiceMinutesToday')}
                aria-label="View practice minutes details"
                className="rounded-[12px] p-3 shadow-lg border cursor-pointer hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a855f7'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-kpi-subtitle">Practice Minutes Today</p>
                    <p className="dashboard-kpi-number">{overview.practiceMinutesToday}</p>
                  </div>
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)' }}>
                    <Clock className="text-[#a855f7]" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {overview.practiceMinutesToday > 0 ? 'Keep up the great work!' : 'Start practicing today'}
                </div>
              </motion.div>

              {/* Next Event */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleCardClick('nextEvent')}
                aria-label="View next event details"
                className="rounded-[12px] p-3 shadow-lg border cursor-pointer hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#22c55e'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="dashboard-kpi-subtitle">Next Event</p>
                    <p className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>{overview.nextEvent.name}</p>
                  </div>
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)' }}>
                    <CalendarDays className="text-[#22c55e]" size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {overview.nextEvent.date ? `${overview.nextEvent.date} ${overview.nextEvent.time || ''}` : 'No upcoming events'}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="mb-8">
          {/* Tabs */}
          <div className="rounded-xl shadow-lg border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(255,255,255,0.1)' }}>
          {/* Tab Headers */}
          <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setActiveTab('practice')}
              aria-label="Practice and Questions tab"
              aria-selected={activeTab === 'practice'}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${
                activeTab === 'practice'
                  ? 'border-b-2'
                  : ''
              }`}
              style={activeTab === 'practice' 
                ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' }
                : { color: 'var(--text-muted)' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'practice') {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'practice') {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Target size={18} />
                Practice & Questions
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              aria-label="Skill Analytics tab"
              aria-selected={activeTab === 'analytics'}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${
                activeTab === 'analytics'
                  ? 'border-b-2'
                  : ''
              }`}
              style={activeTab === 'analytics' 
                ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' }
                : { color: 'var(--text-muted)' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'analytics') {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'analytics') {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity size={18} />
                Skill Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              aria-label="Contests tab"
              aria-selected={activeTab === 'contests'}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${
                activeTab === 'contests'
                  ? 'border-b-2'
                  : ''
              }`}
              style={activeTab === 'contests' 
                ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' }
                : { color: 'var(--text-muted)' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'contests') {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'contests') {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={18} />
                Contests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              aria-label="GitHub Stats tab"
              aria-selected={activeTab === 'github'}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${
                activeTab === 'github'
                  ? 'border-b-2'
                  : ''
              }`}
              style={activeTab === 'github' 
                ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' }
                : { color: 'var(--text-muted)' }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'github') {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'github') {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Github size={18} />
                GitHub Stats
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'practice' && (
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                  Practice & Questions
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                  Track your progress across different platforms and get detailed analytics
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quick Practice */}
                  <div className="border rounded-lg p-4 hover:shadow-md transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'var(--surface-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Quick Practice</h4>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Start coding and get instant code analysis
                    </p>
                    <HoverButton
                      onClick={() => navigate('/practice')}
                      className="w-full"
                      glowColor="#3B82F6"
                      backgroundColor="transparent"
                      textColor="var(--text-primary)"
                      hoverTextColor="#60A5FA"
                    >
                      Start Practice
                    </HoverButton>
                  </div>

                  {/* Question Tracker */}
                  <div className="border rounded-lg p-4 hover:shadow-md transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'var(--surface-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a855f7' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Question Tracker</h4>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Monitor your coding practice progress and track solved problems across platforms
                    </p>
                    <HoverButton 
                      onClick={() => navigate('/questions')}
                      className="w-full"
                      glowColor="#a855f7"
                      backgroundColor="transparent"
                      textColor="var(--text-primary)"
                      hoverTextColor="#C084FC"
                    >
                      View Tracker
                    </HoverButton>
                  </div>

                  {/* Interview Prep */}
                  <div className="border rounded-lg p-4 hover:shadow-md transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'var(--surface-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22c55e' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Interview Prep</h4>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Company-specific questions with detailed evaluation
                    </p>
                    <HoverButton 
                      onClick={() => {}}
                      className="w-full"
                      glowColor="#22c55e"
                      backgroundColor="transparent"
                      textColor="var(--text-primary)"
                      hoverTextColor="#4ADE80"
                    >
                      Start Prep
                    </HoverButton>
                  </div>

                  {/* Aptitude Prep */}
                  <div className="border rounded-lg p-4 hover:shadow-md transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'var(--surface-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fb923c' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Aptitude Prep</h4>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Practice topic-wise aptitude questions with detailed explanations
                    </p>
                    <HoverButton
                      onClick={() => navigate('/aptitude')}
                      className="w-full"
                      glowColor="#fb923c"
                      backgroundColor="transparent"
                      textColor="var(--text-primary)"
                      hoverTextColor="#FBBF24"
                    >
                      Start Practice
                    </HoverButton>
                  </div>

                  {/* Video Lectures */}
                  <div 
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'var(--surface-light)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    data-testid="card-video-lectures"
                  >
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Video Lectures</h4>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Interactive lectures with timed pop-up quizzes
                    </p>
                    <HoverButton
                      onClick={() => navigate('/video-lectures')}
                      className="w-full"
                      glowColor="#6366f1"
                      backgroundColor="transparent"
                      textColor="var(--text-primary)"
                      hoverTextColor="#818CF8"
                    >
                      Browse Lectures
                    </HoverButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                  Skill Analytics
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                  Detailed skill analytics coming soon... (Activity heatmap, topic analysis, strengths/weaknesses)
                </p>
                
                {/* Recent Activity - Integrated into Analytics Tab */}
                <div className="rounded-[12px] shadow-lg border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <button
                    onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                    aria-label={isActivityExpanded ? "Collapse recent activity" : "Expand recent activity"}
                    aria-expanded={isActivityExpanded}
                    className="w-full p-3 border-b transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-inset"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-light)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Activity size={16} />
                      Recent Activity
                      {overview.recentSubmissions && overview.recentSubmissions.length > 0 && (
                        <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                          ({overview.recentSubmissions.length})
                        </span>
                      )}
                    </h3>
                    {isActivityExpanded ? (
                      <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isActivityExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="max-h-[320px] overflow-y-auto">
                          {overview.recentSubmissions && overview.recentSubmissions.length > 0 ? (
                            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                              {overview.recentSubmissions.map((submission: any, index: number) => {
                                const submissionId = submission._id || submission.id || `${submission.timestamp || submission.submittedAt}-${index}`
                                const isNew = newSubmissionIds.has(submissionId)
                                const problemTitle = submission.problemTitle || submission.title || submission.problemName || 'Unknown Problem'
                                const platform = submission.platform || submission.source || 'Unknown'
                                const status = submission.status || submission.result || 'Unknown'
                                const timestamp = submission.timestamp || submission.submittedAt || submission.createdAt || null

                                return (
                                  <motion.div
                                    key={submissionId}
                                    initial={isNew ? { opacity: 0, x: -10 } : false}
                                    animate={isNew ? { opacity: 1, x: 0 } : {}}
                                    transition={isNew ? { duration: 0.3 } : {}}
                                    className="p-3 transition-all duration-500 rounded-[12px]"
                                    style={{
                                      backgroundColor: isNew ? 'var(--accent-soft)' : 'transparent',
                                      borderLeft: isNew ? '2px solid var(--accent)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isNew) e.currentTarget.style.backgroundColor = 'var(--surface-light)'
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isNew) e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                          {problemTitle}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {platform}
                                          </span>
                                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(status)}`}>
                                            {status}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                      <Clock size={10} />
                                      <span>{formatTimeAgo(timestamp)}</span>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="p-6 text-center">
                              <Activity className="mx-auto mb-2" size={24} style={{ color: 'var(--text-muted)' }} />
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                No recent activity
                              </p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                Start solving problems to see your activity here
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Collapsed view - show only first 2 items */}
                  {!isActivityExpanded && overview.recentSubmissions && overview.recentSubmissions.length > 0 && (
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      {overview.recentSubmissions.slice(0, 2).map((submission: any, index: number) => {
                        const submissionId = submission._id || submission.id || `${submission.timestamp || submission.submittedAt}-${index}`
                        const isNew = newSubmissionIds.has(submissionId)
                        const problemTitle = submission.problemTitle || submission.title || submission.problemName || 'Unknown Problem'
                        const platform = submission.platform || submission.source || 'Unknown'
                        const status = submission.status || submission.result || 'Unknown'
                        const timestamp = submission.timestamp || submission.submittedAt || submission.createdAt || null

                        return (
                          <motion.div
                            key={submissionId}
                            initial={isNew ? { opacity: 0, x: -10 } : false}
                            animate={isNew ? { opacity: 1, x: 0 } : {}}
                            transition={isNew ? { duration: 0.3 } : {}}
                            className="p-3 transition-all duration-500 rounded-[12px]"
                            style={{
                              backgroundColor: isNew ? 'var(--accent-soft)' : 'transparent',
                              borderLeft: isNew ? '2px solid var(--accent)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!isNew) e.currentTarget.style.backgroundColor = 'var(--surface-light)'
                            }}
                            onMouseLeave={(e) => {
                              if (!isNew) e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                  {problemTitle}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {platform}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(status)}`}>
                                    {status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <Clock size={10} />
                                <span>{formatTimeAgo(timestamp)}</span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contests' && (
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
                </div>
              }>
                <ContestsSection />
              </Suspense>
            )}

            {activeTab === 'github' && (
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
                </div>
              }>
                <GitHubStatsSection />
              </Suspense>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* SlideOver Component */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={handleCloseSlideOver}
        title={
          slideOverType === 'solved' ? 'Solved Problems' :
          slideOverType === 'streak' ? 'Streak History' :
          slideOverType === 'efficiency' ? 'Practice Sessions' :
          slideOverType === 'upcoming' ? 'Upcoming Interview' : ''
        }
      >
        {slideOverType === 'solved' && (
          <div>
            <div className="mb-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Total: {getSolvedProblems().length} problems solved
              </p>
            </div>
            {getSolvedProblems().length > 0 ? (
              <div className="space-y-3">
                {getSolvedProblems().map((problem: any, index: number) => {
                  const problemTitle = problem.problemTitle || problem.title || problem.problemName || 'Unknown Problem'
                  const platform = problem.platform || problem.source || 'Unknown'
                  const timestamp = problem.timestamp || problem.submittedAt || problem.createdAt || null
                  
                  return (
                    <div
                      key={problem._id || problem.id || index}
                      className="p-3 rounded-lg border"
                      style={{ backgroundColor: 'var(--surface-light)', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            {problemTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>{platform}</span>
                            {timestamp && (
                              <>
                                <span>•</span>
                                <span>{formatTimeAgo(timestamp)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <CheckCircle2 className="flex-shrink-0 ml-2" size={20} style={{ color: '#22c55e' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto mb-3" size={32} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No solved problems yet
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Start solving problems to see them here
                </p>
              </div>
            )}
          </div>
        )}

        {slideOverType === 'streak' && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="text-[#fb923c]" size={20} />
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                  {overview.currentStreak} day streak
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Keep it going! Solve at least one problem each day.
              </p>
            </div>
            <div className="space-y-2">
              {getStreakHistory().map((day, index) => (
                <div
                  key={day.date}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: day.solved > 0 ? 'rgba(34, 197, 94, 0.1)' : 'var(--surface-light)',
                    borderColor: day.solved > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium min-w-[60px]" style={{ color: 'var(--text-primary)' }}>
                        {day.day}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {day.solved > 0 ? (
                        <>
                          <CheckCircle2 className="text-[#22c55e]" size={16} />
                          <span className="text-sm font-medium" style={{ color: '#22c55e' }}>
                            {day.solved} solved
                          </span>
                        </>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slideOverType === 'efficiency' && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-purple-600 dark:text-purple-400" size={20} />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Practice Sessions
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Today: {overview.practiceMinutesToday} minutes
              </p>
            </div>
            <div className="space-y-2">
              {getPracticeSessions().map((session, index) => {
                const isToday = index === getPracticeSessions().length - 1
                return (
                  <div
                    key={session.date}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: isToday ? 'rgba(168, 85, 247, 0.1)' : 'var(--surface-light)',
                      borderColor: isToday ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium min-w-[60px]" style={{ color: 'var(--text-primary)' }}>
                          {session.day}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        {isToday && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {session.minutes} minutes
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {session.sessions} session{session.sessions !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {slideOverType === 'upcoming' && (
          <div>
            {overview.nextEvent && overview.nextEvent.name !== 'No upcoming events' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="text-[#22c55e]" size={20} />
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                      {overview.nextEvent.name}
                    </h3>
                  </div>
                  {overview.nextEvent.date && (
                    <div className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                        <span>Date: {overview.nextEvent.date}</span>
                      </div>
                      {overview.nextEvent.time && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                          <span>Time: {overview.nextEvent.time}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'rgba(59,130,246,0.3)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Preparation Tips
                  </h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--accent)' }}>•</span>
                      <span>Review common interview questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--accent)' }}>•</span>
                      <span>Practice coding problems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--accent)' }}>•</span>
                      <span>Prepare questions to ask the interviewer</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDays className="mx-auto mb-3" size={32} style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
                  No Upcoming Interviews
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Schedule an interview to track your preparation
                </p>
                <button
                  onClick={() => {
                    handleCloseSlideOver()
                  }}
                  className="px-4 py-2 text-white rounded-lg transition-all"
                  style={{ backgroundColor: 'var(--accent)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  Schedule Interview
                </button>
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  )
}

export default NewStudentDashboard
