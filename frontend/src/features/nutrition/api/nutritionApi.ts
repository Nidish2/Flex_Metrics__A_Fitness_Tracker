import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/config/apiClient'

export const useNutritionSummaryQuery = (date: string) => {
  return useQuery({
    queryKey: ['nutritionSummary', date],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/meals/summary?date=${date}`)
      return res.data
    },
  })
}

export const useMealsListQuery = (date: string) => {
  return useQuery({
    queryKey: ['mealsList', date],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/meals?date=${date}&size=50`)
      return res.data
    },
  })
}

// Queries the backend food search endpoint which proxies to OpenFoodFacts with server side caching
export const useFoodSearchQuery = (query: string) => {
  return useQuery({
    queryKey: ['backendFoodSearch', query],
    queryFn: async () => {
      if (query.trim().length < 3) return []
      const res = await apiClient.get(`/api/v1/foods/search?q=${encodeURIComponent(query)}&pageSize=6`)
      return (res.data || []).map((item: any) => ({
        foodName: item.name,
        calories: item.caloriesPer100g || 0,
        proteinG: item.proteinPer100g || 0,
        carbsG: item.carbsPer100g || 0,
        fatG: item.fatPer100g || 0,
      }))
    },
    enabled: query.trim().length >= 3,
  })
}

export const useLogMealMutation = (date: string, onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/v1/meals', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionSummary', date] })
      queryClient.invalidateQueries({ queryKey: ['mealsList', date] })
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    },
  })
}

export const useDeleteMealMutation = (date: string, onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mealId: string) => {
      await apiClient.delete(`/api/v1/meals/${mealId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionSummary', date] })
      queryClient.invalidateQueries({ queryKey: ['mealsList', date] })
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    },
  })
}
