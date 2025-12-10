import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Code2,
  TrendingUp,
  Target,
  Award,
  Activity,
  Flame,
  Clock,
  CheckCircle2,
  Zap,
  Star,
  Calendar,
  Trophy,
  BarChart3,
  ExternalLink
} from 'lucide-react'
import CodingPlatformsTab from '../components/CodingPlatformsTab'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [activeTab, setActiveTab] = useState<'overview' | 'coding-platforms'>('overview')
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'languages' | 'topics' | 'timeline'>('overview')

  // User stats - all start at 0
  const stats = {
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    accuracy: 0,
    aiAnalysis: 0,
    contestRating: 0,
    contestsParticipated: 0,
    globalRank: null,
    totalContributions: 0,
    activeDays: 0
  }

  // Language proficiency - empty until user codes
  const languageStats = [
    { name: 'Java', problems: 0, percentage: 0, color: 'bg-orange-500' },
    { name: 'Python', problems: 0, percentage: 0, color: 'bg-blue-500' },
    { name: 'JavaScript', problems: 0, percentage: 0, color: 'bg-yellow-500' },
    { name: 'C++', problems: 0, percentage: 0, color: 'bg-purple-500' },
    { name: 'TypeScript', problems: 0, percentage: 0, color: 'bg-blue-600' }
  ]

  // Topic mastery - empty until user practices
  const topicStats = [
    { name: 'Arrays', solved: 0, total: 150, level: 'Beginner' },
    { name: 'Dynamic Programming', solved: 0, total: 200, level: 'Beginner' },
    { name: 'Trees & Graphs', solved: 0, total: 180, level: 'Beginner' },
    { name: 'String Manipulation', solved: 0, total: 120, level: 'Beginner' },
    { name: 'Sorting & Searching', solved: 0, total: 100, level: 'Beginner' },
    { name: 'Linked Lists', solved: 0, total: 90, level: 'Beginner' },
    { name: 'Greedy Algorithms', solved: 0, total: 110, level: 'Beginner' },
    { name: 'Backtracking', solved: 0, total: 80, level: 'Beginner' }
  ]

  // Generate last 365 days of activity data
  const generateActivityData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        count: 0,
        level: 0
      })
    }
    return data
  }

  const activityData = generateActivityData()

  // Get color based on activity level
  const getActivityColor = (level: number) => {
    const colors = [
      'bg-gray-200 dark:bg-gray-700',
      'bg-green-200 dark:bg-green-900',
      'bg-green-400 dark:bg-green-700',
      'bg-green-600 dark:bg-green-500',
      'bg-green-800 dark:bg-green-400'
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

  // Get level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      case 'Intermediate': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
      case 'Advanced': return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
      case 'Expert': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive skill analytics and insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Member since</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">January 2025</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700 mb-8">
          <div className="border-b border-gray-200 dark:border-dark-700">
            <div className="flex gap-2 p-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'coding-platforms', label: 'Coding Platforms', icon: ExternalLink }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Stats Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Solved */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                      <Trophy className="text-gray-300 dark:text-gray-700" size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.totalSolved}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Problems Solved</p>
                    {stats.totalSolved === 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Start solving to track progress</p>
                    )}
                  </motion.div>

                  {/* Current Streak */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Flame className="text-orange-600 dark:text-orange-400" size={24} />
                      </div>
                      <Flame className="text-gray-300 dark:text-gray-700" size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.currentStreak}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Day Streak</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Max: {stats.maxStreak} days
                    </p>
                  </motion.div>

                  {/* Accuracy */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Target className="text-green-600 dark:text-green-400" size={24} />
                      </div>
                      <TrendingUp className="text-gray-300 dark:text-gray-700" size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.accuracy}%
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy Rate</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {stats.acceptedSubmissions}/{stats.totalSubmissions} accepted
                    </p>
                  </motion.div>

                  {/* Contest Rating */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Award className="text-purple-600 dark:text-purple-400" size={24} />
                      </div>
                      <Star className="text-gray-300 dark:text-gray-700" size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.contestRating}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contest Rating</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {stats.contestsParticipated} contests
                    </p>
                  </motion.div>
                </div>

                {/* Problem Solving Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Easy Problems</h3>
                      <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">
                        {stats.easySolved}/500
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${(stats.easySolved / 500) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.easySolved === 0 ? 'No easy problems solved yet' : `${((stats.easySolved / 500) * 100).toFixed(1)}% complete`}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medium Problems</h3>
                      <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-semibold">
                        {stats.mediumSolved}/800
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div
                        className="bg-yellow-500 h-3 rounded-full transition-all"
                        style={{ width: `${(stats.mediumSolved / 800) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.mediumSolved === 0 ? 'No medium problems solved yet' : `${((stats.mediumSolved / 800) * 100).toFixed(1)}% complete`}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hard Problems</h3>
                      <div className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold">
                        {stats.hardSolved}/300
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all"
                        style={{ width: `${(stats.hardSolved / 300) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.hardSolved === 0 ? 'No hard problems solved yet' : `${((stats.hardSolved / 300) * 100).toFixed(1)}% complete`}
                    </p>
                  </motion.div>
                </div>

                  {/* Sub Tabs */}
                  <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700">
                    <div className="border-b border-gray-200 dark:border-dark-700">
                      <div className="flex gap-2 p-2">
                        {[
                          { id: 'overview', label: 'Overview', icon: BarChart3 },
                          { id: 'languages', label: 'Languages', icon: Code2 },
                          { id: 'topics', label: 'Topics', icon: Target },
                          { id: 'timeline', label: 'Timeline', icon: Calendar }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              activeSubTab === tab.id
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                            }`}
                          >
                            <tab.icon size={18} />
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Overview Sub Tab */}
                      {activeSubTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Activity Heatmap */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Coding Activity
                  </h3>
                  {stats.totalContributions === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <Activity className="mx-auto mb-3 text-gray-400 dark:text-gray-600" size={48} />
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No activity yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Start solving problems to see your contribution graph
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-dark-700 p-6 rounded-lg overflow-x-auto">
                      <div className="flex gap-1">
                        {getWeeksData().map((week, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                              <div
                                key={dayIndex}
                                className={`w-3 h-3 rounded-sm ${getActivityColor(day.level)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
                                title={`${day.date}: ${day.count} contributions`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
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
                    </div>
                  )}
                </div>

                {/* AI Analysis Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Code Analysis Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aiAnalysis}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Code Analyses</p>
                      {stats.aiAnalysis === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Use code analyzer for detailed insights</p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Issues Fixed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Security & performance fixes</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Code Quality Score</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Out of 100</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

                      {/* Languages Sub Tab */}
                      {activeSubTab === 'languages' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Language Proficiency
                </h3>
                {languageStats.every(lang => lang.problems === 0) ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <Code2 className="mx-auto mb-3 text-gray-400 dark:text-gray-600" size={48} />
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No language data yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Solve problems in different languages to see your proficiency
                    </p>
                  </div>
                ) : (
                  languageStats.map((lang) => (
                    <div key={lang.name} className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 ${lang.color} rounded`}></div>
                          <span className="font-semibold text-gray-900 dark:text-white">{lang.name}</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {lang.problems} problems ({lang.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`${lang.color} h-2 rounded-full transition-all`}
                          style={{ width: `${lang.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

                      {/* Topics Sub Tab */}
                      {activeSubTab === 'topics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Topic Mastery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topicStats.map((topic) => (
                    <div key={topic.name} className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{topic.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(topic.level)}`}>
                          {topic.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {topic.solved}/{topic.total}
                        </span>
                      </div>
                      {topic.solved === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">Start practicing this topic</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

                      {/* Timeline Sub Tab */}
                      {activeSubTab === 'timeline' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Activity
                          </h3>
                          <div className="text-center py-12 bg-gray-50 dark:bg-dark-700 rounded-lg">
                            <Clock className="mx-auto mb-3 text-gray-400 dark:text-gray-600" size={48} />
                            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No activity yet</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Your recent submissions and achievements will appear here
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
            )}

            {/* Coding Platforms Tab */}
            {activeTab === 'coding-platforms' && (
              <CodingPlatformsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
