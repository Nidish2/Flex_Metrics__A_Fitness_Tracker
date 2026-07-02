import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/config/apiClient'
import { useAuthStore } from '@/store/useAuthStore'

export const useLoginMutation = (onSuccessCallback?: (data: any) => void, onErrorCallback?: (error: any) => void) => {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await apiClient.post('/api/v1/auth/authenticate', credentials)
      return response.data
    },
    onSuccess: (data, variables) => {
      const user = data.user || { name: 'User', email: variables.email }
      login(user, data.token)
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
    onError: (error) => {
      if (onErrorCallback) {
        onErrorCallback(error)
      }
    },
  })
}

export const useRegisterMutation = (onSuccessCallback?: (data: any) => void, onErrorCallback?: (error: any) => void) => {
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: async (registerData: any) => {
      const response = await apiClient.post('/api/v1/auth/register', registerData)
      return response.data
    },
    onSuccess: (data, variables) => {
      const user = data.user || { name: `${variables.firstName} ${variables.lastName}`, email: variables.email }
      login(user, data.token)
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
    onError: (error) => {
      if (onErrorCallback) {
        onErrorCallback(error)
      }
    },
  })
}
