import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'sonner'

const PRIMARY_URL = import.meta.env.VITE_API_BASE_URL || ''
const FALLBACK_URL = import.meta.env.VITE_API_FALLBACK_URL || ''

let currentBaseURL = PRIMARY_URL

export const apiClient = axios.create({
  baseURL: currentBaseURL,
  timeout: 10000, // 10 seconds timeout to detect unresponsive/sleeping servers
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle Fallbacks and 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If request fails (network error or timeout) and we haven't retried yet, switch to fallback URL
    if (
      FALLBACK_URL &&
      (!error.response || error.code === 'ECONNABORTED') &&
      !originalRequest._retryWithFallback
    ) {
      originalRequest._retryWithFallback = true

      // Switch current URL (between primary and fallback)
      currentBaseURL = currentBaseURL === PRIMARY_URL ? FALLBACK_URL : PRIMARY_URL
      apiClient.defaults.baseURL = currentBaseURL
      originalRequest.baseURL = currentBaseURL

      console.warn(`API request failed. Automatically retrying with fallback URL: ${currentBaseURL}`)
      return apiClient(originalRequest)
    }

    if (error.response && error.response.status === 401) {
      // Clear Zustand auth state
      useAuthStore.getState().logout()
      
      // Trigger Toast notification
      toast.error('Session expired. Please log in again.', {
        id: 'session-expired-toast',
      })
      
      // Redirect to login page
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
