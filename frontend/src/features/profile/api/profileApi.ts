import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/config/apiClient'

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/profile')
      return res.data
    },
  })
}

export const useBodyMetricsQuery = (size: number = 15) => {
  return useQuery({
    queryKey: ['bodyMetrics', size],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/profile/metrics?size=${size}`)
      return res.data
    },
  })
}

export const useUpdateProfileMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await apiClient.put('/api/v1/profile', updatedData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    },
  })
}

export const useLogMetricMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newMetric: { weightKg: number; bodyFatPercentage?: number }) => {
      const res = await apiClient.post('/api/v1/profile/metrics', newMetric)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodyMetrics'] })
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    },
  })
}
