import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { RootState } from './store'
import { setSystemTheme } from './store/slices/themeSlice'
import { selectResolvedTheme } from './store/slices/themeSlice'
import { selectIsAuthenticated } from './store/slices/authSlice'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StudentDashboard from './pages/StudentDashboard'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import ThemeProvider from './components/providers/ThemeProvider'

const App: React.FC = () => {
  const dispatch = useDispatch()
  const resolvedTheme = useSelector(selectResolvedTheme)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // System theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemTheme(e.matches ? 'dark' : 'light'))
    }
    
    // Set initial system theme
    dispatch(setSystemTheme(mediaQuery.matches ? 'dark' : 'light'))
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [dispatch])

  // Apply theme to document
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