import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Box, Sphere, Torus } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Brain, Code, Users, Zap, Star } from 'lucide-react'

// 3D Scene Component
const Scene3D = () => {
  return (
    <group>
      {/* Floating geometric shapes */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Box position={[-2, 2, 0]} scale={0.8} args={[1, 1, 1]}>
          <meshStandardMaterial color="#3b82f6" opacity={0.8} transparent />
        </Box>
      </Float>
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <Sphere position={[2, -1, -1]} scale={0.6} args={[1, 32, 32]}>
          <meshStandardMaterial color="#8b5cf6" opacity={0.7} transparent />
        </Sphere>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2.5}>
        <Torus position={[0, 1, -2]} scale={0.5} args={[1, 0.3, 16, 32]}>
          <meshStandardMaterial color="#06b6d4" opacity={0.6} transparent />
        </Torus>
      </Float>
      
      {/* Ambient and point lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
    </group>
  )
}

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "Intelligent Code Analysis",
      description: "Get detailed code analysis with syntax checking, complexity analysis, and improvement suggestions"
    },
    {
      icon: Code,
      title: "Multiple Languages",
      description: "Practice with 13+ programming languages including Python, JavaScript, Java, and more"
    },
    {
      icon: Users,
      title: "Mock Interviews",
      description: "Prepare with realistic interview simulations and receive detailed feedback"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Courses",
      description: "Access structured learning paths designed by industry experts"
    },
    {
      icon: Zap,
      title: "Real-time Feedback",
      description: "Get instant code analysis and suggestions as you learn"
    },
    {
      icon: Star,
      title: "Achievement System",
      description: "Track your progress with gamified learning and achievements"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-width section-padding">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="text-2xl font-bold text-gradient"
              whileHover={{ scale: 1.05 }}
            >
              SAP
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-brand-400 transition-colors">Features</a>
              <a href="#about" className="hover:text-brand-400 transition-colors">About</a>
              <a href="#contact" className="hover:text-brand-400 transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="btn btn-ghost btn-md hover:bg-white/10"
              >
                Login
              </Link>
              <Link 
                to="/admin/login" 
                className="btn btn-ghost btn-md hover:bg-red-500/20 text-red-300 border-red-500/30"
              >
                Admin
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-primary btn-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with 3D Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Scene3D />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              autoRotate 
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto section-padding">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 text-gradient-primary"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Master Coding
            <br />
            <span className="text-gradient-accent">Land Your Dream Job</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Skill analytics platform with interactive coding challenges, mock interviews, 
            and personalized learning paths designed for career success.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link 
              to="/signup"
              className="btn btn-primary btn-xl group"
            >
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/login"
              className="btn btn-outline btn-xl"
            >
              Watch Demo
            </Link>
          </motion.div>
          
          <motion.div 
            className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-2" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-400 mr-2" />
              <span>50K+ Students</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-green-400 mr-2" />
              <span>13+ Languages</span>
            </div>
          </motion.div>
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900/50 backdrop-blur-sm">
        <div className="container-width section-padding">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Powerful Features for Success
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to excel in coding interviews and land your dream job
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  className="card glass p-8 hover:bg-white/5 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-accent-600">
        <div className="container-width section-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Enhance Your Skills?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of students who have successfully landed their dream jobs
            </p>
            <Link 
              to="/signup"
              className="btn bg-white text-brand-600 hover:bg-gray-100 btn-xl group"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container-width section-padding">
          <div className="text-center">
            <div className="text-2xl font-bold text-gradient mb-4">SAP — Skill Analytics Platform</div>
            <p className="text-gray-400 mb-6">
              Empowering learners to achieve their career goals through technology
            </p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <Link to="/admin/login" className="hover:text-red-400 transition-colors text-sm">Admin</Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © 2025 SAP — Skill Analytics Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage