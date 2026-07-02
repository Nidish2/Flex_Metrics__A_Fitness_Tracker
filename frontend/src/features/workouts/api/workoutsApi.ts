import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/config/apiClient'
import { useUIStore } from '@/store/useUIStore'

export const useExercisesQuery = (muscleGroup: string) => {
  return useQuery({
    queryKey: ['exercises', muscleGroup],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/exercises?muscleGroup=${muscleGroup}&size=50`)
      return res.data
    },
  })
}

export const useWorkoutsHistoryQuery = (size: number = 15) => {
  return useQuery({
    queryKey: ['workoutsHistory'],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/workouts?size=${size}`)
      return res.data
    },
  })
}

export const useWorkoutDetailQuery = (workoutId: string | undefined) => {
  return useQuery({
    queryKey: ['workoutDetail', workoutId],
    queryFn: async () => {
      if (!workoutId) return null
      const res = await apiClient.get(`/api/v1/workouts/${workoutId}`)
      return res.data
    },
    enabled: !!workoutId,
  })
}

export const useStartWorkoutMutation = (onSuccessCallback?: (data: any) => void) => {
  const { resetTimer, setActiveWorkout } = useUIStore()

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/api/v1/workouts')
      return res.data
    },
    onSuccess: (data) => {
      resetTimer()
      setActiveWorkout(data.id, data.note || `Session #${data.id.substring(0, 4)}`)
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
  })
}

export const useAddExerciseMutation = (onSuccessCallback?: (data: any) => void) => {
  const { activeWorkoutId } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!activeWorkoutId) throw new Error('No active workout')
      const res = await apiClient.post(`/api/v1/workouts/${activeWorkoutId}/exercises`, {
        exerciseId,
      })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeWorkout', activeWorkoutId] })
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
  })
}

export const useAddSetMutation = (onSuccessCallback?: (data: any) => void) => {
  const { activeWorkoutId } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workoutExerciseId, setRequest }: { workoutExerciseId: string; setRequest: any }) => {
      const res = await apiClient.post(`/api/v1/workouts/exercises/${workoutExerciseId}/sets`, setRequest)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeWorkout', activeWorkoutId] })
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
  })
}

export const useUpdateSetMutation = (onSuccessCallback?: (data: any) => void) => {
  const { activeWorkoutId } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ setId, updateRequest }: { setId: string; updateRequest: any }) => {
      const res = await apiClient.put(`/api/v1/workouts/sets/${setId}`, updateRequest)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeWorkout', activeWorkoutId] })
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
  })
}

export const useFinishWorkoutMutation = (onSuccessCallback?: (data: any) => void) => {
  const { activeWorkoutId, resetTimer } = useUIStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (note: string) => {
      if (!activeWorkoutId) throw new Error('No active workout')
      const res = await apiClient.post(`/api/v1/workouts/${activeWorkoutId}/finish`, {
        note: note || 'Completed Workout Session',
      })
      return res.data
    },
    onSuccess: (data) => {
      resetTimer()
      queryClient.invalidateQueries({ queryKey: ['workoutsHistory'] })
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
  })
}

export const useSeedExercisesMutation = (onSuccessCallback?: (data: any) => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/api/v1/admin/seed-exercises')
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      if (onSuccessCallback) {
        onSuccessCallback(data)
      }
    },
  })
}
