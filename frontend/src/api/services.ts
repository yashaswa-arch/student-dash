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
  analyzeCode: async (code: string, language: string) => {
    const response = await api.post('/ai/analyze-code', { code, language })
    return response.data
  },

  // Get learning recommendations
  getRecommendations: async () => {
    const response = await api.get('/ai/recommendations')
    return response.data
  }
}