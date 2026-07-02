import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'sonner'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
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

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
