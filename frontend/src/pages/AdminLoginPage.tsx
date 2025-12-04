import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Float, Box, Sphere } from '@react-three/drei'
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { AppDispatch } from '../store'
import { adminAPI } from '../api/services'

// 3D Admin Background
const AdminScene = () => {
  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={2}>
        <Box position={[-3, 2, -4]} scale={0.3} args={[1, 1, 1]}>
          <meshStandardMaterial color="#dc2626" opacity={0.3} transparent />
        </Box>
      </Float>
      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.8}>
        <Sphere position={[4, -1, -6]} scale={0.4} args={[1, 32, 32]}>
          <meshStandardMaterial color="#b91c1c" opacity={0.2} transparent />
        </Sphere>
      </Float>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.2}>
        <Box position={[2, 3, -5]} scale={0.25} args={[1, 1, 1]}>
          <meshStandardMaterial color="#991b1b" opacity={0.4} transparent />
        </Box>
      </Float>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  )
}

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  // Check if admin is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    const adminUser = localStorage.getItem('adminUser')
    
    if (adminToken && adminUser) {
      try {
        const user = JSON.parse(adminUser)
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
          return
        }
      } catch (error) {
        // Invalid admin data, clear it
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      }
    }
  }, [navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Use proper admin authentication
      const response = await adminAPI.login(formData)
      
      console.log('Admin login response:', response) // Debug log
      
      if (response.success) {
        // Store admin token
        localStorage.setItem('adminToken', response.token)
        localStorage.setItem('adminUser', JSON.stringify(response.user))
        
        console.log('Admin login successful, navigating to dashboard') // Debug log
        
        // Navigate to simple admin dashboard for testing
        navigate('/admin/simple-dashboard')
      }
    } catch (error: any) {
      console.error('Admin login error:', error)
      setError(
        error.response?.data?.message || 
        error.message ||
        'Admin login failed. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  const goToHome = () => {
    navigate('/')
  }

  const goToStudentLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <AdminScene />
        </Canvas>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <motion.button
          onClick={goToHome}
          className="flex items-center space-x-2 text-white hover:text-red-300 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield className="h-6 w-6" />
          <span className="font-semibold">StudentDash Admin</span>
        </motion.button>
        
        <motion.button
          onClick={goToStudentLogin}
          className="px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Student Login
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Shield className="h-8 w-8 text-red-400" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-gray-300">Secure administrative login</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-200 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="admin@studentdash.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Access Admin Panel</span>
                  </span>
                )}
              </motion.button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>This is a restricted admin area. All access attempts are logged and monitored.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminLoginPage