import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Float, Box, Sphere, Torus } from '@react-three/drei'
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle,
  Lock,
  Award,
  Target,
  BarChart3
} from 'lucide-react'
import { courseAPI } from '../api/services'

// 3D Background Scene
const CourseDetailScene = () => {
  return (
    <group>
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={2}>
        <Box position={[-3, 2, -4]} scale={0.3} args={[1, 1, 1]}>
          <meshStandardMaterial color="#10b981" opacity={0.3} transparent />
        </Box>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.5}>
        <Sphere position={[3, -1, -5]} scale={0.25} args={[1, 32, 32]}>
          <meshStandardMaterial color="#3b82f6" opacity={0.4} transparent />
        </Sphere>
      </Float>
      
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={2.2}>
        <Torus position={[0, 3, -6]} scale={0.2} args={[1, 0.3, 16, 32]}>
          <meshStandardMaterial color="#8b5cf6" opacity={0.35} transparent />
        </Torus>
      </Float>
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#3b82f6" />
    </group>
  )
}

interface Course {
  _id: string
  title: string
  description: string
  tags: string | string[]
  instructor?: {
    name: string
    email: string
  }
  level?: string
  duration?: string
  lessonsCount?: number
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return
      
      try {
        setLoading(true)
        const response = await courseAPI.getCourse(courseId)
        if (response.success) {
          setCourse(response.data)
        } else {
          setError('Failed to load course details')
        }
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  const handleEnroll = async () => {
    if (!courseId) return
    
    try {
      setEnrolling(true)
      const response = await courseAPI.enrollCourse(courseId)
      if (response.success) {
        setIsEnrolled(true)
        alert('Successfully enrolled in course!')
      } else {
        alert('Failed to enroll in course')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('Failed to enroll in course')
    } finally {
      setEnrolling(false)
    }
  }

  const handleStartLearning = () => {
    // TODO: Navigate to first lesson
    alert('Course content coming soon! This will take you to the first lesson.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'Course not found'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const tags = Array.isArray(course.tags) 
    ? course.tags 
    : typeof course.tags === 'string' 
      ? course.tags.split(' ') 
      : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <CourseDetailScene />
        </Canvas>
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-10 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors mr-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <motion.div
              className="glass rounded-2xl p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {course.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">{course.duration || '8 weeks'}</p>
                      <p className="text-gray-400 text-sm">Duration</p>
                    </div>
                    <div className="text-center">
                      <BookOpen className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">{course.lessonsCount || 24}</p>
                      <p className="text-gray-400 text-sm">Lessons</p>
                    </div>
                    <div className="text-center">
                      <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">{course.level || 'Beginner'}</p>
                      <p className="text-gray-400 text-sm">Level</p>
                    </div>
                    <div className="text-center">
                      <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">4.8</p>
                      <p className="text-gray-400 text-sm">Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {isEnrolled ? (
                  <button
                    onClick={handleStartLearning}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Continue Learning</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Target className="h-5 w-5" />
                    <span>{enrolling ? 'Enrolling...' : 'Enroll Now'}</span>
                  </button>
                )}
                <button className="btn btn-outline">
                  <Award className="h-5 w-5 mr-2" />
                  Preview Course
                </button>
              </div>
            </motion.div>

            {/* Course Content Preview */}
            <motion.div
              className="glass rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
              <div className="space-y-4">
                {/* Sample lessons */}
                {[
                  { title: 'Introduction and Setup', duration: '15 min', locked: false },
                  { title: 'Basic Concepts', duration: '25 min', locked: !isEnrolled },
                  { title: 'Hands-on Practice', duration: '30 min', locked: !isEnrolled },
                  { title: 'Advanced Topics', duration: '40 min', locked: !isEnrolled },
                  { title: 'Final Project', duration: '60 min', locked: !isEnrolled }
                ].map((lesson, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      lesson.locked 
                        ? 'border-gray-600 bg-gray-800/30' 
                        : 'border-blue-500/30 bg-blue-900/20 hover:bg-blue-900/30 cursor-pointer'
                    } transition-colors`}
                  >
                    <div className="flex items-center space-x-3">
                      {lesson.locked ? (
                        <Lock className="h-5 w-5 text-gray-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      <div>
                        <h3 className={`font-semibold ${lesson.locked ? 'text-gray-400' : 'text-white'}`}>
                          {lesson.title}
                        </h3>
                        <p className="text-gray-500 text-sm">{lesson.duration}</p>
                      </div>
                    </div>
                    {!lesson.locked && (
                      <Play className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Info */}
            <motion.div
              className="glass rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Instructor</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{course.instructor?.name || 'Expert Instructor'}</h4>
                  <p className="text-gray-400 text-sm">Senior Developer</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-4">
                Experienced instructor with 10+ years in the industry, passionate about teaching and helping students succeed.
              </p>
            </motion.div>

            {/* Course Progress */}
            {isEnrolled && (
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-white">0%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">0 of {course.lessonsCount || 24} lessons completed</p>
              </motion.div>
            )}

            {/* What You'll Learn */}
            <motion.div
              className="glass rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">What You'll Learn</h3>
              <ul className="space-y-3">
                {[
                  'Master the fundamentals and core concepts',
                  'Build real-world projects and applications',
                  'Best practices and industry standards',
                  'Problem-solving and critical thinking',
                  'Hands-on coding experience'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage