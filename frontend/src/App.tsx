import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { setSystemTheme, selectResolvedTheme } from './store/slices/themeSlice'
import { selectIsAuthenticated } from './store/slices/authSlice'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StudentDashboard from './pages/NewStudentDashboard'
import ProfilePage from './pages/ProfilePage'
import QuestionTrackerPage from './pages/QuestionTrackerPage'
import QuestionDetailPage from './pages/QuestionDetailPageNew'
import CodeAnalysisPage from './pages/CodeAnalysisPage'
import LeetCodeTracker from './pages/LeetCodeTracker'
import QuickPracticePage from './pages/QuickPracticePage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import SimpleAdminDashboard from './pages/SimpleAdminDashboard'
import AptitudeHome from './pages/AptitudeHome'
import AptitudeQuiz from './pages/AptitudeQuiz'
import AptitudeResult from './pages/AptitudeResult'
import ContestsPage from './pages/ContestsPage'
import VideoLectureList from './pages/VideoLectures/VideoLectureList'
import SeriesVideos from './pages/VideoLectures/SeriesVideos'
import VideoPage from './pages/VideoLectures/VideoPage'
import TestLogin from './pages/TestLogin'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import ThemeProvider from './components/providers/ThemeProvider'

const App: React.FC = () => {
  const dispatch = useDispatch()
  const resolvedTheme = useSelector(selectResolvedTheme)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemTheme(e.matches ? 'dark' : 'light'))
    }
    dispatch(setSystemTheme(mediaQuery.matches ? 'dark' : 'light'))
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [dispatch])

  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-950 dark:bg-dark-900 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><LandingPage /></motion.div>} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><LoginPage /></motion.div>} />
              <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><SignupPage /></motion.div>} />
              <Route path="/admin/login" element={<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><AdminLoginPage /></motion.div>} />
              <Route path="/admin/dashboard" element={<AdminProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><AdminDashboard /></motion.div></AdminProtectedRoute>} />
              <Route path="/admin/simple-dashboard" element={<SimpleAdminDashboard />} />
              {import.meta.env.MODE === 'development' && <Route path="/dev-login" element={<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><TestLogin /></motion.div>} />}
              <Route path="/dashboard" element={<ProtectedRoute><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><StudentDashboard /></motion.div></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><ProfilePage /></motion.div></ProtectedRoute>} />
              <Route path="/questions" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><QuestionTrackerPage /></motion.div></ProtectedRoute>} />
              <Route path="/questions/:id" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><QuestionDetailPage /></motion.div></ProtectedRoute>} />
              <Route path="/code-analysis" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><CodeAnalysisPage /></motion.div></ProtectedRoute>} />
              <Route path="/leetcode" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><LeetCodeTracker /></motion.div></ProtectedRoute>} />
              <Route path="/practice" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><QuickPracticePage /></motion.div></ProtectedRoute>} />
              <Route path="/aptitude" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><AptitudeHome /></motion.div></ProtectedRoute>} />
              <Route path="/aptitude/quiz" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><AptitudeQuiz /></motion.div></ProtectedRoute>} />
              <Route path="/aptitude/result" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><AptitudeResult /></motion.div></ProtectedRoute>} />
              <Route path="/contests" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><ContestsPage /></motion.div></ProtectedRoute>} />
              <Route path="/video-lectures" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><VideoLectureList /></motion.div></ProtectedRoute>} />
              <Route path="/video-lectures/series/:seriesId" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><SeriesVideos /></motion.div></ProtectedRoute>} />
              <Route path="/video-lectures/video/:videoId" element={<ProtectedRoute><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}><VideoPage /></motion.div></ProtectedRoute>} />
              <Route path="*" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="min-h-screen flex items-center justify-center bg-gray-950 dark:bg-dark-900"><div className="text-center"><h1 className="text-4xl font-bold text-white mb-4">404</h1><p className="text-gray-400 mb-8">Page not found</p><Navigate to="/" replace /></div></motion.div>} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App