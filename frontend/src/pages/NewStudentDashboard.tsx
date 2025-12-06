import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { logoutUser } from '../store/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  TrendingUp, 
  Target, 
  Calendar,
  Github,
  Activity,
  Zap,
  CheckCircle2,
  Trophy,
  Flame,
  User,
  Settings,
  LogOut,
  Bell,
  Search
} from 'lucide-react'

const NewStudentDashboard: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const [activeTab, setActiveTab] = useState<'practice' | 'analytics' | 'contests' | 'github'>('practice')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  // Real user stats - starts at 0 until user makes progress
  const [stats] = useState({
    totalSolved: 0,
    currentStreak: 0,
    maxStreak: 0,
    aiAnalysis: 0,
    contestRating: 0,
    accuracy: 0
  })

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-dark-800 shadow-md border-b border-gray-200 dark:border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Code2 className="text-blue-600 dark:text-blue-400" size={32} />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Student Dash
              </span>
            </div>

            {/* Center - Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search problems, topics..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right Side - Actions & Profile */}
            <div className="flex items-center gap-4">
              {/* AI Code Analysis Button */}
              <button
                onClick={() => navigate('/code-analysis')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Zap size={18} />
                <span>AI Analysis</span>
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 relative">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden"
                    >
                      {/* Profile Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="text-center p-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalSolved}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Solved</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.contestRating}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          </div>
                        </div>
                      </div>

                      {/* Activity Heatmap */}
                      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Activity in the last year
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activityData.filter(d => d.count > 0).length > 0 
                              ? `${activityData.filter(d => d.count > 0).length} active days`
                              : 'No activity yet'}
                          </p>
                        </div>
                        
                        {/* Heatmap Grid */}
                        <div className="overflow-x-auto">
                          {activityData.filter(d => d.count > 0).length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
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
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        >
                          <User size={18} />
                          <span className="text-sm">View Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            // Navigate to settings
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                        >
                          <Settings size={18} />
                          <span className="text-sm">Settings</span>
                        </button>

                        <div className="border-t border-gray-200 dark:border-dark-700 my-2"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
      <div className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track your coding journey with AI-powered insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Solved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Solved</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSolved}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp size={16} className="mr-1" />
              {stats.totalSolved > 0 ? '+12 this week' : 'Start practicing to see progress'}
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.currentStreak} days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Flame className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {stats.maxStreak > 0 ? `Max: ${stats.maxStreak} days` : 'No streak yet'}
            </div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Analyzed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.aiAnalysis}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Zap className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {stats.accuracy > 0 ? `${stats.accuracy}% accuracy` : 'Not analyzed yet'}
            </div>
          </motion.div>

          {/* Contest Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contest Rating</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.contestRating}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Trophy className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp size={16} className="mr-1" />
              {stats.contestRating > 0 ? '+45 this month' : 'No contests yet'}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-dark-700">
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'practice'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Target size={18} />
                Practice & Questions
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity size={18} />
                Analytics & Progress
              </div>
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'contests'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={18} />
                Contests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'github'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Practice & Questions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Track your progress across different platforms and get AI-powered feedback
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quick Practice */}
                  <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Practice</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Start coding and get instant AI feedback
                    </p>
                    <button
                      onClick={() => navigate('/quick-practice')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Practice
                    </button>
                  </div>

                  {/* Question Tracker */}
                  <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Question Tracker</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Track questions across LeetCode, CodeForces, etc.
                    </p>
                    <button 
                      onClick={() => navigate('/question-tracker')}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Tracker
                    </button>
                  </div>

                  {/* Interview Prep */}
                  <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Interview Prep</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Company-specific questions with AI evaluation
                    </p>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Start Prep
                    </button>
                  </div>

                  {/* Aptitude Prep */}
                  <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Aptitude Prep</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Practice topic-wise aptitude questions with detailed explanations
                    </p>
                    <button
                      onClick={() => navigate('/aptitude')}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Start Practice
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Analytics & Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed analytics coming soon... (Activity heatmap, topic analysis, strengths/weaknesses)
                </p>
              </div>
            )}

            {activeTab === 'contests' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Upcoming Contests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Contest calendar and reminders coming soon...
                </p>
              </div>
            )}

            {activeTab === 'github' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  GitHub Stats & Projects
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your GitHub to see contributions, projects, and dev stats...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewStudentDashboard
