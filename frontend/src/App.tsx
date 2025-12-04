import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { setSystemTheme, selectResolvedTheme } from './store/slices/themeSlice'
import { selectIsAuthenticated } from './store/slices/authSlice'

// Pages
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

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import ThemeProvider from './components/providers/ThemeProvider'

const App: React.FC = () => {
  const dispatch = useDispatch()
  const resolvedTheme = useSelector(selectResolvedTheme)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Detect and sync system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemTheme(e.matches ? 'dark' : 'light'))
    }

    dispatch(setSystemTheme(mediaQuery.matches ? 'dark' : 'light'))
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [dispatch])

  // Apply theme class to <html>
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
      <Router future={{ v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LandingPage />
                    </motion.div>
                  )
                }
              />

              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <LoginPage />
                    </motion.div>
                  )
                }
              />

              <Route
                path="/signup"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <SignupPage />
                    </motion.div>
                  )
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/login"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <AdminLoginPage />
                  </motion.div>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AdminDashboard />
                    </motion.div>
                  </AdminProtectedRoute>
                }
              />

              <Route path="/admin/simple-dashboard" element={<SimpleAdminDashboard />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StudentDashboard />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProfilePage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              {/* Old alias for tracker (kept for compatibility) */}
              <Route
                path="/questions"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuestionTrackerPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              {/* New analytics Question Tracker route */}
              <Route
                path="/question-tracker"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuestionTrackerPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/questions/:id"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuestionDetailPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/code-analysis"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CodeAnalysisPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leetcode-tracker"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LeetCodeTracker />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quick-practice"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuickPracticePage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App


