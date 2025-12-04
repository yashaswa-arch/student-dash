import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../api/axios'
import {
  Activity,
  AlertCircle,
  BarChart2,
  Calendar,
  Circle,
  Code2,
  Loader2,
  PieChart as PieChartIcon,
  Table as TableIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface OverviewStats {
  totalSubmissions: number
  totalSolved: number
  attemptedButUnsolved: number
  solvedLast7Days: number
}

interface TopicStat {
  topic: string
  totalSubmissions: number
  totalSolved: number
}

interface DifficultyStat {
  difficulty: 'Easy' | 'Medium' | 'Hard'
  totalSubmissions: number
  totalSolved: number
}

interface PracticeSubmission {
  _id: string
  createdAt: string
  questionTitle?: string
  topics?: string[]
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  language: string
  status: 'success' | 'error'
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22c55e',
  Medium: '#facc15',
  Hard: '#ef4444',
}

const QuestionTrackerPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user)

  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const [topicStats, setTopicStats] = useState<TopicStat[]>([])
  const [topicLoading, setTopicLoading] = useState(false)
  const [topicError, setTopicError] = useState<string | null>(null)

  const [difficultyStats, setDifficultyStats] = useState<DifficultyStat[]>([])
  const [difficultyLoading, setDifficultyLoading] = useState(false)
  const [difficultyError, setDifficultyError] = useState<string | null>(null)

  const [submissions, setSubmissions] = useState<PracticeSubmission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)

  const [filterTopic, setFilterTopic] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const topicOptions = useMemo(
    () => ['all', ...topicStats.map((t) => t.topic)],
    [topicStats],
  )

  const languageOptions = useMemo(() => {
    const langs = new Set<string>()
    submissions.forEach((s) => langs.add(s.language))
    return ['all', ...Array.from(langs)]
  }, [submissions])

  const canPageNext = page * limit < total

  useEffect(() => {
    if (!user?._id) return

    const userId = user._id

    const fetchOverview = async () => {
      try {
        setOverviewLoading(true)
        setOverviewError(null)
        const res = await api.get('/submissions/stats/overview', {
          params: { userId },
        })
        setOverview(res.data.data as OverviewStats)
      } catch (error: any) {
        console.error('Error fetching overview stats:', error)
        setOverviewError(error.response?.data?.message || 'Failed to load overview stats')
      } finally {
        setOverviewLoading(false)
      }
    }

    const fetchByTopic = async () => {
      try {
        setTopicLoading(true)
        setTopicError(null)
        const res = await api.get('/submissions/stats/by-topic', {
          params: { userId },
        })
        setTopicStats(res.data.data as TopicStat[])
    } catch (error: any) {
        console.error('Error fetching topic stats:', error)
        setTopicError(error.response?.data?.message || 'Failed to load topic stats')
    } finally {
        setTopicLoading(false)
      }
    }

    const fetchByDifficulty = async () => {
      try {
        setDifficultyLoading(true)
        setDifficultyError(null)
        const res = await api.get('/submissions/stats/by-difficulty', {
          params: { userId },
        })
        setDifficultyStats(res.data.data as DifficultyStat[])
    } catch (error: any) {
        console.error('Error fetching difficulty stats:', error)
        setDifficultyError(error.response?.data?.message || 'Failed to load difficulty stats')
    } finally {
        setDifficultyLoading(false)
      }
    }

    fetchOverview()
    fetchByTopic()
    fetchByDifficulty()
  }, [user?._id])

  useEffect(() => {
    if (!user?._id) return

    const fetchSubmissions = async () => {
      try {
        setSubmissionsLoading(true)
        setSubmissionsError(null)

        const params: any = {
          userId: user._id,
          page,
          limit,
        }

        if (filterTopic !== 'all') params.topic = filterTopic
        if (filterDifficulty !== 'all') params.difficulty = filterDifficulty
        if (filterLanguage !== 'all') params.language = filterLanguage
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate

        const res = await api.get('/submissions/list', { params })
        setSubmissions(res.data.data as PracticeSubmission[])
        setTotal(res.data.total as number)
      } catch (error: any) {
        console.error('Error fetching submissions list:', error)
        setSubmissionsError(error.response?.data?.message || 'Failed to load submissions')
      } finally {
        setSubmissionsLoading(false)
      }
    }

    fetchSubmissions()
  }, [user?._id, page, limit, filterTopic, filterDifficulty, filterLanguage, startDate, endDate])

  const handleResetFilters = () => {
    setFilterTopic('all')
    setFilterDifficulty('all')
    setFilterLanguage('all')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Please login to view your Question Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your analytics dashboard is only available when you are signed in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Question Tracker Analytics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  See how you&apos;re progressing across topics, difficulty, and time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Solved */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Solved</p>
              {overviewLoading ? (
                <div className="mt-2 h-6 w-16 rounded bg-gray-200 dark:bg-dark-700 animate-pulse" />
              ) : (
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {overview?.totalSolved ?? 0}
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                All successful Quick Practice submissions
              </p>
              </div>
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <Circle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
          </div>

          {/* Solved last 7 days */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex items-center justify-between">
              <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Solved Last 7 Days
              </p>
              {overviewLoading ? (
                <div className="mt-2 h-6 w-16 rounded bg-gray-200 dark:bg-dark-700 animate-pulse" />
              ) : (
                <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {overview?.solvedLast7Days ?? 0}
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Keep your streak going
              </p>
                </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

          {/* Attempted but unsolved */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex items-center justify-between">
              <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Attempted But Unsolved
              </p>
              {overviewLoading ? (
                <div className="mt-2 h-6 w-16 rounded bg-gray-200 dark:bg-dark-700 animate-pulse" />
              ) : (
                <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {overview?.attemptedButUnsolved ?? 0}
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Great revision targets to turn into AC
              </p>
                </div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>

          {/* Total submissions */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex items-center justify-between">
              <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Submissions
              </p>
              {overviewLoading ? (
                <div className="mt-2 h-6 w-16 rounded bg-gray-200 dark:bg-dark-700 animate-pulse" />
              ) : (
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {overview?.totalSubmissions ?? 0}
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Across all questions and languages
              </p>
                </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </div>
              </div>
            </div>

        {overviewError && (
          <div className="rounded-lg border border-red-500/40 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-xs text-red-700 dark:text-red-200 flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{overviewError}</span>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topic bar chart */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Questions by Topic
                </h2>
              </div>
            </div>
            <div className="flex-1 min-h-[260px]">
              {topicLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading topic stats...
          </div>
              ) : topicError ? (
                <div className="flex flex-col items-center justify-center h-full text-xs text-red-600 dark:text-red-300 space-y-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{topicError}</span>
        </div>
              ) : topicStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400 space-y-2">
                  <Code2 className="w-6 h-6 opacity-60" />
                  <span>No topic stats yet. Solve a question in Quick Practice to see analytics.</span>
          </div>
        ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1f2937"
                      vertical={false}
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="topic"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      formatter={(value) => (
                        <span className="text-xs text-gray-300">{value}</span>
                      )}
                    />
                    <Bar dataKey="totalSolved" name="Solved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="totalSubmissions"
                      name="Total"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
                    </div>

          {/* Difficulty pie chart */}
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Questions by Difficulty
                </h2>
                    </div>
                  </div>
            <div className="flex-1 min-h-[260px]">
              {difficultyLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading difficulty stats...
                  </div>
              ) : difficultyError ? (
                <div className="flex flex-col items-center justify-center h-full text-xs text-red-600 dark:text-red-300 space-y-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{difficultyError}</span>
                </div>
              ) : difficultyStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400 space-y-2">
                  <Code2 className="w-6 h-6 opacity-60" />
                  <span>No difficulty stats yet.</span>
          </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      formatter={(value) => (
                        <span className="text-xs text-gray-300">{value}</span>
                      )}
                    />
                    <Pie
                      data={difficultyStats}
                      dataKey="totalSubmissions"
                      nameKey="difficulty"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {difficultyStats.map((entry, index) => (
                        <Cell
                          // eslint-disable-next-line react/no-array-index-key
                          key={index}
                          fill={DIFFICULTY_COLORS[entry.difficulty] || '#64748b'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
      </div>

        {/* Submissions table + filters */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Submission History
                </h2>
              </div>
                    <button
              onClick={handleResetFilters}
              className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
            >
              Reset Filters
                    </button>
                </div>

          {/* Filters */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Topic
                  </label>
              <select
                value={filterTopic}
                onChange={(e) => {
                  setFilterTopic(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {topicOptions.map((t) => (
                  <option key={t} value={t}>
                    {t === 'all' ? 'All topics' : t}
                  </option>
                ))}
              </select>
                </div>

                  <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Difficulty
                    </label>
                    <select
                value={filterDifficulty}
                onChange={(e) => {
                  setFilterDifficulty(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Language
                    </label>
                    <select
                value={filterLanguage}
                onChange={(e) => {
                  setFilterLanguage(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All languages' : lang.toUpperCase()}
                  </option>
                ))}
                    </select>
                  </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  From
                    </label>
                    <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  To
                  </label>
                    <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                  </div>
                  </div>
                </div>

          {/* Table */}
          <div className="px-4 py-3">
            {submissionsLoading ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
                <Loader2 className="w-5 h-5 mr-2 inline-block animate-spin" />
                Loading submissions...
                  </div>
            ) : submissionsError ? (
              <div className="py-6 text-center text-xs text-red-600 dark:text-red-300 flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{submissionsError}</span>
                </div>
            ) : submissions.length === 0 ? (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
                No submissions found for the selected filters.
                  </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700 text-xs">
                  <thead className="bg-gray-50 dark:bg-dark-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Question Title
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Topics
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Difficulty
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Language
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                    {submissions.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-dark-700/60">
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {formatDateTime(s.createdAt)}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white max-w-xs truncate">
                          {s.questionTitle || 'Untitled question'}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {(s.topics || []).join(', ') || '-'}
                        </td>
                        <td className="px-3 py-2">
                          {s.difficulty ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                s.difficulty === 'Easy'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : s.difficulty === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {s.difficulty}
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200 uppercase">
                          {s.language}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              s.status === 'success'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {s.status === 'success' ? 'Success' : 'Error'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
            )}
                </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                <div>
              Showing{' '}
              <span className="font-semibold">
                {total === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, total)}
              </span>{' '}
              of <span className="font-semibold">{total}</span> submissions
                </div>
            <div className="flex items-center gap-2">
                    <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-dark-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                Previous
                    </button>
              <span>
                Page <span className="font-semibold">{page}</span>
              </span>
                        <button
                disabled={!canPageNext}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-dark-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                Next
                        </button>
                      </div>
                  </div>
                </div>
                </div>
    </div>
  )
}

export default QuestionTrackerPage



