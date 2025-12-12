import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Brain, Code, Users, Zap, Star } from 'lucide-react'
import PulseBeamsFirstDemo from '../components/hero/PulseBeamsFirstDemo'
import Animated3DScene from '../components/hero/Animated3DScene'

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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)]/80 backdrop-blur-sm border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-width section-padding">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="text-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-white">SAP</span>
              <span className="text-[var(--accent)]">.</span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Features</a>
              <a href="#how-it-works" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">How it works</a>
              <a href="#pricing" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
              <a href="#about" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">About</a>
              <a href="#contact" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-4 py-2"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg pt-16">
        {/* 3D Background Scene */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <Animated3DScene />
        </div>
        
        <div className="container-width section-padding py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] leading-tight"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Master coding.
                <br />
                <span className="text-[var(--accent)]">Build your future.</span>
              </h1>
              
              <p 
                className="text-xl md:text-2xl text-[var(--text-muted)] max-w-2xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Practice smarter with real-time analytics, mock interviews, and personalized learning paths.
              </p>
              
              
              <div 
                className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-muted)]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>4.9</span>
                </div>
                <span>•</span>
                <span>50k+ Students</span>
                <span>•</span>
                <span>13 Languages</span>
              </div>
            </motion.div>

            {/* Right Side - PulseBeams */}
            <motion.div 
              className="relative h-[400px] md:h-[500px] lg:h-[600px] hidden md:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative w-full h-full">
                <PulseBeamsFirstDemo />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="container-width section-padding">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Powerful Features for Success
            </h2>
            <p 
              className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Everything you need to excel in coding interviews and land your dream job
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  className="p-8 rounded-xl border border-white/5 hover:border-[var(--accent-soft)] transition-all duration-300 group relative overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-light)' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  {/* Subtle 3D background effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-transparent rounded-full blur-2xl" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-[var(--accent-soft)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform relative overflow-hidden">
                      <Icon className="h-8 w-8 text-[var(--accent)] relative z-10" />
                      <div className="absolute inset-0 opacity-20">
                        <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-transparent" />
                      </div>
                    </div>
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-4 text-[var(--text-primary)]"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-[var(--text-muted)]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {feature.description}
                  </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--accent-soft)]">
        <div className="container-width section-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Ready to Enhance Your Skills?
            </h2>
            <p 
              className="text-xl mb-8 text-[var(--text-muted)] max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Join thousands of students who have successfully landed their dream jobs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="container-width section-padding">
          <div className="text-center">
            <div 
              className="text-2xl font-bold mb-4 text-[var(--text-primary)]"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              SAP — Skill Analytics Platform
            </div>
            <p 
              className="text-[var(--text-muted)] mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Empowering learners to achieve their career goals through technology
            </p>
            <div className="flex justify-center space-x-6 text-[var(--text-muted)]">
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
              <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Support</a>
            </div>
            <p 
              className="text-[var(--text-muted)] text-sm mt-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              © 2025 SAP — Skill Analytics Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
