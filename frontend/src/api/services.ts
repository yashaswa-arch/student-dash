import api from './axios'

export interface User {
  _id: string
  username: string
  email: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
  message?: string
}

// Authentication API functions
export const authAPI = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Register new user
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials)
    return response.data
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile')
    return response.data.user
  },

  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Verify token
  verifyToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/verify')
      return true
    } catch {
      return false
    }
  }
}

// User management API functions
export const userAPI = {
  // Get user dashboard data
  getDashboard: async () => {
    const response = await api.get('/users/dashboard')
    return response.data
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put('/users/profile', userData)
    return response.data
  }
}

// Course API functions
export const courseAPI = {
  // Get all courses
  getCourses: async () => {
    const response = await api.get('/courses')
    return response.data
  },

  // Get course by ID
  getCourse: async (id: string) => {
    const response = await api.get(`/courses/${id}`)
    return response.data
  },

  // Enroll in course
  enrollCourse: async (courseId: string) => {
    const response = await api.post(`/courses/${courseId}/enroll`)
    return response.data
  }
}

// AI Service API functions
export const aiAPI = {
  // Analyze code
  analyzeCode: async (analysisRequest: {
    code: string;
    language: string;
    context?: string;
    skill_level?: string;
    include_suggestions?: boolean;
    include_ai_analysis?: boolean;
    include_recommendations?: boolean;
  }) => {
    const response = await api.post('/ai/analyze', analysisRequest)
    return response.data
  },

  // Quick code analysis
  quickAnalyze: async (code: string, language: string) => {
    const response = await api.post('/ai/quick-analysis', { code, language })
    return response.data
  },

  // Get learning recommendations
  getRecommendations: async (userId?: string) => {
    const endpoint = userId ? `/ai/recommendations/${userId}` : '/ai/recommendations'
    const response = await api.get(endpoint)
    return response.data
  },

  // Get supported languages
  getLanguages: async () => {
    const response = await api.get('/ai/languages')
    return response.data
  },

  // Explain code
  explainCode: async (code: string, language: string) => {
    const response = await api.post('/ai/explain-code', { code, language })
    return response.data
  },

  // Get improvement suggestions
  suggestImprovements: async (code: string, language: string, skillLevel = 'beginner') => {
    const response = await api.post('/ai/suggest-improvements', { 
      code, 
      language, 
      skill_level: skillLevel 
    })
    return response.data
  },

  // Detect bugs
  detectBugs: async (code: string, language: string) => {
    const response = await api.post('/ai/detect-bugs', { code, language })
    return response.data
  },

  // Check AI service health
  checkHealth: async () => {
    const response = await api.get('/ai/health')
    return response.data
  }
}

// Practice submission API functions
export interface PracticeSubmissionPayload {
  userId: string
  questionId: string
  questionTitle: string
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  language: string
  code: string
  stdout: string
  stderr: string
  status: 'success' | 'error'
  timeTakenInMinutes?: number
  source?: string
}

export const practiceSubmissionAPI = {
  create: async (payload: PracticeSubmissionPayload) => {
    const response = await api.post('/submissions', payload)
    return response.data
  },
}

// Admin API functions
export const adminAPI = {
  // Admin login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/admin/login', credentials)
    return response.data
  },

  // Setup admin account
  setup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post('/admin/setup', credentials)
    return response.data
  },

  // Get all users
  getUsers: async () => {
    const adminToken = localStorage.getItem('adminToken')
    const response = await api.get('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    return response.data
  },

  // Get admin stats
  getStats: async () => {
    const adminToken = localStorage.getItem('adminToken')
    const response = await api.get('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    return response.data
  },

  // Update user role
  updateUserRole: async (userId: string, role: string) => {
    const adminToken = localStorage.getItem('adminToken')
    const response = await api.patch(`/admin/users/${userId}/role`, { role }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    return response.data
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const adminToken = localStorage.getItem('adminToken')
    const response = await api.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    return response.data
  }
}

// Aptitude API interfaces
export interface AptitudeQuestion {
  _id: string
  topic: string
  questionText: string
  options: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface AptitudeAnswer {
  questionId: string
  selectedIndex: number
}

export interface AptitudeAttemptResponse {
  _id: string
  topic: string
  difficulty: string
  numQuestions: number
  score: number
  percentage: number
  completedAt: string
  answers: Array<{
    questionId: string
    questionText: string
    options: string[]
    correctIndex: number
    selectedIndex: number
    isCorrect: boolean
    explanation: string
  }>
}

export interface AptitudeStats {
  topic: string
  attempts: number
  averageScore: number
  averagePercentage: number
}

// Aptitude API functions
export const aptitudeAPI = {
  // Get available topics
  getTopics: async (): Promise<string[]> => {
    const response = await api.get('/aptitude/topics')
    return response.data.data
  },

  // Get questions by topic, difficulty, and count
  getQuestions: async (
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: 10 | 20
  ): Promise<AptitudeQuestion[]> => {
    const response = await api.get('/aptitude/questions', {
      params: { topic, difficulty, count }
    })
    return response.data.data
  },

  // Submit attempt (creates and evaluates in one call)
  submitAttempt: async (
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    numQuestions: 10 | 20,
    answers: AptitudeAnswer[]
  ): Promise<AptitudeAttemptResponse> => {
    const response = await api.post('/aptitude/attempts', {
      topic,
      difficulty,
      numQuestions,
      answers
    })
    return response.data.data
  },

  // Get recent attempts (uses authenticated user)
  getRecentAttempts: async (): Promise<any[]> => {
    const response = await api.get('/aptitude/attempts/recent')
    return response.data.attempts || response.data.data || []
  },

  // Get stats summary (uses authenticated user)
  getStatsSummary: async (): Promise<any[]> => {
    const response = await api.get('/aptitude/stats/summary')
    return response.data.topics || response.data.data || []
  }
}