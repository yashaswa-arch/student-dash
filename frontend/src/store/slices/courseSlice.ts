import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  modules: number
  lessons: number
  rating: number
  enrolledStudents: number
  image: string
  price: number
  tags: string[]
  language: string
  lastUpdated: string
  createdAt: string
}

interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  lessons: string[]
  duration: number
  isCompleted: boolean
}

interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  type: 'video' | 'text' | 'quiz' | 'coding' | 'assignment'
  content: string
  duration: number
  order: number
  isCompleted: boolean
  resources: string[]
}

interface CoursesState {
  courses: Course[]
  currentCourse: Course | null
  modules: Module[]
  lessons: Lesson[]
  enrolledCourses: Course[]
  favorites: string[]
  searchQuery: string
  filters: {
    category: string
    level: string
    language: string
    price: 'free' | 'paid' | 'all'
    rating: number
  }
  sort: 'popular' | 'newest' | 'rating' | 'price'
  isLoading: boolean
  error: string | null
}

const initialState: CoursesState = {
  courses: [],
  currentCourse: null,
  modules: [],
  lessons: [],
  enrolledCourses: [],
  favorites: [],
  searchQuery: '',
  filters: {
    category: '',
    level: '',
    language: '',
    price: 'all',
    rating: 0,
  },
  sort: 'popular',
  isLoading: false,
  error: null,
}

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCoursesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setCoursesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload
      state.isLoading = false
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload
    },
    setModules: (state, action: PayloadAction<Module[]>) => {
      state.modules = action.payload
    },
    setLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.lessons = action.payload
    },
    setEnrolledCourses: (state, action: PayloadAction<Course[]>) => {
      state.enrolledCourses = action.payload
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload)
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload)
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSort: (state, action: PayloadAction<typeof initialState.sort>) => {
      state.sort = action.payload
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
      state.searchQuery = ''
    },
    markLessonCompleted: (state, action: PayloadAction<string>) => {
      const lesson = state.lessons.find(l => l.id === action.payload)
      if (lesson) {
        lesson.isCompleted = true
      }
    },
    markModuleCompleted: (state, action: PayloadAction<string>) => {
      const module = state.modules.find(m => m.id === action.payload)
      if (module) {
        module.isCompleted = true
      }
    },
    updateCourseProgress: (state, action: PayloadAction<{ courseId: string; progress: number }>) => {
      const course = state.enrolledCourses.find(c => c.id === action.payload.courseId)
      if (course) {
        // You might want to add a progress field to the Course interface
        ;(course as any).progress = action.payload.progress
      }
    },
  },
})

export const {
  setCoursesLoading,
  setCoursesError,
  setCourses,
  setCurrentCourse,
  setModules,
  setLessons,
  setEnrolledCourses,
  addToFavorites,
  removeFromFavorites,
  setSearchQuery,
  setFilters,
  setSort,
  clearFilters,
  markLessonCompleted,
  markModuleCompleted,
  updateCourseProgress,
} = courseSlice.actions

export default courseSlice.reducer

// Selectors
export const selectCourses = (state: { courses: CoursesState }) => state.courses.courses
export const selectCurrentCourse = (state: { courses: CoursesState }) => state.courses.currentCourse
export const selectModules = (state: { courses: CoursesState }) => state.courses.modules
export const selectLessons = (state: { courses: CoursesState }) => state.courses.lessons
export const selectEnrolledCourses = (state: { courses: CoursesState }) => state.courses.enrolledCourses
export const selectFavorites = (state: { courses: CoursesState }) => state.courses.favorites
export const selectSearchQuery = (state: { courses: CoursesState }) => state.courses.searchQuery
export const selectFilters = (state: { courses: CoursesState }) => state.courses.filters
export const selectSort = (state: { courses: CoursesState }) => state.courses.sort
export const selectCoursesLoading = (state: { courses: CoursesState }) => state.courses.isLoading
export const selectCoursesError = (state: { courses: CoursesState }) => state.courses.error