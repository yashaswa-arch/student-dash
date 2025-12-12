import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BACKEND}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

// Request interceptor - add auth token if available (but don't require it for public endpoints)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear tokens and redirect if it's not a public endpoint
      // Public endpoints: /topics, /series, /series/:id, /series/:id/info
      const url = error.config?.url || '';
      const isPublicEndpoint = 
        url.includes('/video-lectures/topics') ||
        url.includes('/video-lectures/series') ||
        url.includes('/video-lectures/quizzes/');
      
      if (!isPublicEndpoint) {
        // Token expired or invalid for protected endpoints
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('user')
        localStorage.removeItem('adminUser')
        // Don't redirect on public endpoint errors
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
);

export default api;

