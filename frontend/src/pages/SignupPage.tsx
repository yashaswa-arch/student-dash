import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { signupUser, selectAuthLoading, selectAuthError } from '../store/slices/authSlice'
import { AppDispatch } from '../store'
import { AnimatedCharacters } from '../components/auth/AnimatedCharacters'

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const isLoading = useSelector(selectAuthLoading)
  const authError = useSelector(selectAuthError)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    console.log('Form validation passed, attempting signup...')

    try {
      const result = await dispatch(signupUser({
        username: formData.username,
        email: formData.email,
        password: formData.password
      }))
      
      console.log('Signup result:', result)
      
      if (signupUser.fulfilled.match(result)) {
        // Signup successful, navigate to dashboard
        console.log('Signup successful, redirecting to dashboard')
        navigate('/dashboard')
      } else {
        // Signup failed, error is handled by Redux state
        console.log('Signup failed:', authError)
        setErrors({ submit: authError || 'Signup failed. Please try again.' })
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Left Side - Animated Characters */}
      <div className="relative hidden lg:flex flex-col justify-between p-12" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
              <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <span>CodeMaster</span>
          </div>
        </div>

        <AnimatedCharacters 
          isTyping={formData.username.length > 0 || formData.email.length > 0 || formData.password.length > 0}
          password={formData.password}
          showPassword={showPassword}
        />

        <div className="relative z-20 flex items-center gap-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          <a href="#" className="hover:opacity-80 transition-opacity">Privacy Policy</a>
          <a href="#" className="hover:opacity-80 transition-opacity">Terms of Service</a>
          <a href="#" className="hover:opacity-80 transition-opacity">Contact</a>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2), transparent)' }} />
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
        <motion.div
          className="rounded-2xl p-8 shadow-2xl backdrop-blur-xl border"
          style={{ 
            backgroundColor: 'var(--surface)', 
            borderColor: 'rgba(255,255,255,0.1)'
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="text-3xl font-bold mb-2"
              style={{ 
                color: 'var(--text-primary)',
                fontFamily: 'Sora, sans-serif'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Create Account
            </motion.div>
            <motion.p
              style={{ color: 'var(--text-muted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Start building your skills today
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500' : ''}`}
                  style={{ 
                    backgroundColor: 'var(--surface-light)', 
                    borderColor: errors.username ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </motion.div>

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500' : ''}`}
                  style={{ 
                    backgroundColor: 'var(--surface-light)', 
                    borderColor: errors.email ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 pr-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500' : ''}`}
                  style={{ 
                    backgroundColor: 'var(--surface-light)', 
                    borderColor: errors.password ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-10 pr-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  style={{ 
                    backgroundColor: 'var(--surface-light)', 
                    borderColor: errors.confirmPassword ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </motion.div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-sm text-red-400">{errors.submit}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold transition-all group flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--accent)',
                color: 'white'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02, opacity: 0.9 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <motion.div
            className="text-center mt-6 pt-6 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
              Administrative access?{' '}
              <Link 
                to="/admin/login" 
                className="font-medium transition-colors"
                style={{ color: '#ef4444' }}
              >
                Admin Login
              </Link>
            </p>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <Link 
              to="/" 
              className="text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Back to home
            </Link>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage