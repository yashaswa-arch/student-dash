import React from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser, logoutUser } from '../store/slices/authSlice'
import { courseAPI } from '../api/services'
import type { AppDispatch } from '../store'
import { Canvas } from '@react-three/fiber'
import { Float, Box, Sphere, Torus } from '@react-three/drei'

// Course type interface
interface Course {
  _id: string
  title: string
  description: string
  tags: string | string[]  // Backend might return as string or array
  instructor?: {
    name: string
    email: string
  }
}

import { 
  BookOpen, 
  Code, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Star, 
  Brain,
  Calendar,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  Users,
  LogOut,
  User,
  Home
} from 'lucide-react'

// 3D Dashboard Background
const DashboardScene = () => {
  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.5}>
        <Box position={[-4, 3, -5]} scale={0.4} args={[1, 1, 1]}>
          <meshStandardMaterial color="#3b82f6" opacity={0.2} transparent />
        </Box>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2}>
        <Sphere position={[4, -2, -6]} scale={0.3} args={[1, 32, 32]}>
          <meshStandardMaterial color="#8b5cf6" opacity={0.3} transparent />
        </Sphere>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.8}>
        <Torus position={[0, 4, -7]} scale={0.3} args={[1, 0.3, 16, 32]}>
          <meshStandardMaterial color="#06b6d4" opacity={0.25} transparent />
        </Torus>
      </Float>
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
    </group>
  )
}

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, trend, color }: {
  title: string
  value: string
  icon: React.ElementType
  trend?: string
  color: string
}) => (
  <motion.div
    className="card glass p-6 hover:bg-white/5 transition-all duration-300"
    whileHover={{ y: -5, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {trend && (
        <span className="text-green-400 text-sm font-medium">{trend}</span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-gray-400 text-sm">{title}</p>
  </motion.div>
)

// Course Progress Card
const CourseCard = ({ title, progress, language, nextLesson, duration, instructor, description, courseId, onCourseClick }: {
  title: string
  progress: number
  language: string
  nextLesson: string
  duration: string
  instructor?: string
  description?: string
  courseId?: string
  onCourseClick?: (courseId: string) => void
}) => (
  <motion.div
    className="card glass p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    onClick={() => courseId && onCourseClick?.(courseId)}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Code className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{language}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-400">Progress</p>
        <p className="font-semibold text-white">{progress}%</p>
      </div>
    </div>
    
    <div className="mb-4">
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">Next: {nextLesson}</p>
        <p className="text-xs text-gray-500">{duration}</p>
      </div>
      <button 
        className="btn btn-sm btn-primary"
        onClick={(e) => {
          e.stopPropagation()
          courseId && onCourseClick?.(courseId)
        }}
      >
        {progress > 0 ? 'Continue' : 'Start Course'}
        <ArrowRight className="ml-1 h-4 w-4" />
      </button>
    </div>
  </motion.div>
)

// Activity Item
const ActivityItem = ({ type, title, time, status }: {
  type: 'completed' | 'started' | 'achieved' | 'upcoming'
  title: string
  time: string
  status?: string
}) => {
  const getIcon = () => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'started':
        return <Play className="h-5 w-5 text-blue-400" />
      case 'achieved':
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 'upcoming':
        return <Target className="h-5 w-5 text-purple-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <motion.div
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {getIcon()}
      <div className="flex-1">
        <p className="text-white text-sm">{title}</p>
        {status && <p className="text-gray-400 text-xs">{status}</p>}
      </div>
      <span className="text-gray-500 text-xs">{time}</span>
    </motion.div>
  )
}

const StudentDashboard: React.FC = () => {
  const user = useSelector(selectUser)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser())
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const goToHome = () => {
    navigate('/')
  }

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  // State for courses
  const [courses, setCourses] = React.useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = React.useState(true)
  const [coursesError, setCoursesError] = React.useState<string | null>(null)

  // Fetch courses on component mount
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true)
        console.log('Fetching courses...')
        const response = await courseAPI.getCourses()
        console.log('Courses API response:', response)
        
        if (response.success && response.data && response.data.courses) {
          setCourses(response.data.courses)
          console.log('Courses loaded:', response.data.courses.length)
        } else {
          console.error('Invalid response format:', response)
          setCoursesError('Failed to load courses - invalid response format')
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        setCoursesError('Failed to load courses')
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const recentActivity = [
    { type: 'started' as const, title: `Welcome to the platform, ${user?.username || 'Student'}!`, time: 'Just now', status: 'Account created successfully' },
    { type: 'upcoming' as const, title: 'Start your learning journey', time: 'Ready to begin', status: 'Choose your first course' },
    { type: 'upcoming' as const, title: 'Complete your profile', time: 'Optional', status: 'Add your learning goals' }
  ]

  // Fresh user stats
  const stats = [
    { title: 'Courses Completed', value: '0', icon: BookOpen, trend: '+0%', color: 'bg-blue-600' },
    { title: 'Hours Learned', value: '0h', icon: Clock, trend: '+0h', color: 'bg-purple-600' },
    { title: 'Skills Acquired', value: '0', icon: Brain, trend: '+0', color: 'bg-green-600' },
    { title: 'Achievements', value: '0', icon: Trophy, trend: '+0', color: 'bg-orange-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <DashboardScene />
        </Canvas>
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-10 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 container-width section-padding py-8">
        {/* Navigation Header */}
        <motion.div
          className="flex justify-between items-center mb-8 p-4 glass rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={goToHome}
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User className="h-5 w-5" />
              <span>{user?.username || 'Student'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Student'}! 👋
          </h1>
          <p className="text-gray-300 text-lg">
            Ready to continue your coding journey? Let's achieve your goals today.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
            />
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Courses */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <BookOpen className="mr-3 h-6 w-6" />
                  Continue Learning
                </h2>
                <button className="btn btn-ghost btn-sm">View All</button>
              </div>
              <div className="grid gap-6">
                {coursesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading courses...</p>
                  </div>
                ) : coursesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-400">{coursesError}</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="btn btn-primary mt-4"
                    >
                      Retry
                    </button>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Courses Available</h3>
                    <p className="text-gray-400">Check back later for new courses!</p>
                  </div>
                ) : (
                  courses.map((course, index) => {
                    // Handle tags being either string or array
                    const firstTag = Array.isArray(course.tags) 
                      ? course.tags[0] 
                      : typeof course.tags === 'string' 
                        ? course.tags.split(' ')[0] 
                        : 'Programming'
                    
                    return (
                      <CourseCard 
                        key={course._id || index} 
                        courseId={course._id}
                        title={course.title}
                        progress={0} // TODO: Get real progress from API
                        language={firstTag}
                        nextLesson={`Start ${course.title}`}
                        duration="Available now"
                        instructor={course.instructor?.name || 'Instructor'}
                        description={course.description}
                        onCourseClick={handleCourseClick}
                      />
                    )
                  })
                )}
              </div>
            </motion.section>

            {/* Quick Actions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Target className="mr-3 h-6 w-6" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  className="card glass p-6 text-left hover:bg-white/5 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                        Mock Interview
                      </h3>
                      <p className="text-gray-400 text-sm">Practice with AI interviewer</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/code-analysis')}
                  className="card glass p-6 text-left hover:bg-white/5 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-green-300 transition-colors">
                        🤖 AI Code Analysis
                      </h3>
                      <p className="text-gray-400 text-sm">Analyze your code with AI</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  className="card glass p-6 text-left hover:bg-white/5 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        Progress Analytics
                      </h3>
                      <p className="text-gray-400 text-sm">View detailed insights</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  className="card glass p-6 text-left hover:bg-white/5 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-orange-300 transition-colors">
                        Study Groups
                      </h3>
                      <p className="text-gray-400 text-sm">Join collaborative learning</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <motion.section
              className="card glass p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </motion.section>

            {/* Upcoming Events */}
            <motion.section
              className="card glass p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm">JavaScript Bootcamp</p>
                    <p className="text-gray-400 text-xs">Today, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm">Code Review Session</p>
                    <p className="text-gray-400 text-xs">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm">Algorithm Contest</p>
                    <p className="text-gray-400 text-xs">Friday, 6:00 PM</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Achievement Showcase */}
            <motion.section
              className="card glass p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Latest Achievement
              </h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">Problem Solver</h4>
                <p className="text-gray-400 text-sm mb-3">Solved 100+ coding challenges</p>
                <button className="btn btn-sm btn-outline">View All Badges</button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard