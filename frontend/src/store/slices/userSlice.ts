import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserPreferences {
  language: string
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    profileVisible: boolean
    progressVisible: boolean
    achievementsVisible: boolean
  }
  dashboard: {
    layout: 'grid' | 'list'
    density: 'comfortable' | 'compact'
    showStats: boolean
  }
}

interface UserProgress {
  totalCourses: number
  completedCourses: number
  totalLessons: number
  completedLessons: number
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  streak: number
  lastActivity: string
}

interface UserState {
  preferences: UserPreferences
  progress: UserProgress
  achievements: string[]
  enrolledCourses: string[]
  recentActivity: any[]
  learningPath: string[]
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  preferences: {
    language: 'en',
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      progressVisible: true,
      achievementsVisible: true,
    },
    dashboard: {
      layout: 'grid',
      density: 'comfortable',
      showStats: true,
    },
  },
  progress: {
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    streak: 0,
    lastActivity: '',
  },
  achievements: [],
  enrolledCourses: [],
  recentActivity: [],
  learningPath: [],
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    updateProgress: (state, action: PayloadAction<Partial<UserProgress>>) => {
      state.progress = { ...state.progress, ...action.payload }
    },
    addAchievement: (state, action: PayloadAction<string>) => {
      if (!state.achievements.includes(action.payload)) {
        state.achievements.push(action.payload)
      }
    },
    enrollInCourse: (state, action: PayloadAction<string>) => {
      if (!state.enrolledCourses.includes(action.payload)) {
        state.enrolledCourses.push(action.payload)
      }
    },
    unenrollFromCourse: (state, action: PayloadAction<string>) => {
      state.enrolledCourses = state.enrolledCourses.filter(id => id !== action.payload)
    },
    addRecentActivity: (state, action: PayloadAction<any>) => {
      state.recentActivity.unshift(action.payload)
      // Keep only last 50 activities
      if (state.recentActivity.length > 50) {
        state.recentActivity = state.recentActivity.slice(0, 50)
      }
    },
    updateLearningPath: (state, action: PayloadAction<string[]>) => {
      state.learningPath = action.payload
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetUserData: (state) => {
      state.progress = initialState.progress
      state.achievements = []
      state.enrolledCourses = []
      state.recentActivity = []
      state.learningPath = []
      state.error = null
    },
  },
})

export const {
  updatePreferences,
  updateProgress,
  addAchievement,
  enrollInCourse,
  unenrollFromCourse,
  addRecentActivity,
  updateLearningPath,
  setUserLoading,
  setUserError,
  resetUserData,
} = userSlice.actions

export default userSlice.reducer

// Selectors
export const selectUserPreferences = (state: { user: UserState }) => state.user.preferences
export const selectUserProgress = (state: { user: UserState }) => state.user.progress
export const selectUserAchievements = (state: { user: UserState }) => state.user.achievements
export const selectEnrolledCourses = (state: { user: UserState }) => state.user.enrolledCourses
export const selectRecentActivity = (state: { user: UserState }) => state.user.recentActivity
export const selectLearningPath = (state: { user: UserState }) => state.user.learningPath
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading
export const selectUserError = (state: { user: UserState }) => state.user.error