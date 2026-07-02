import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'dark' | 'light'
  activeWorkoutId: string | null
  activeWorkoutName: string | null
  workoutTime: number
  timerPaused: boolean
  toggleTheme: () => void
  setActiveWorkout: (id: string | null, name?: string | null) => void
  setWorkoutTime: (time: number) => void
  incrementTimer: () => void
  resetTimer: () => void
  togglePauseTimer: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      activeWorkoutId: null,
      activeWorkoutName: null,
      workoutTime: 0,
      timerPaused: false,
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setActiveWorkout: (id, name = 'Active Workout') => set({ activeWorkoutId: id, activeWorkoutName: name, timerPaused: false }),
      setWorkoutTime: (time) => set({ workoutTime: time }),
      incrementTimer: () => set((state) => ({ workoutTime: state.workoutTime + 1 })),
      resetTimer: () => set({ workoutTime: 0, activeWorkoutId: null, activeWorkoutName: null, timerPaused: false }),
      togglePauseTimer: () => set((state) => ({ timerPaused: !state.timerPaused })),
    }),
    {
      name: 'fitness-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        activeWorkoutId: state.activeWorkoutId,
        activeWorkoutName: state.activeWorkoutName,
        workoutTime: state.workoutTime,
        timerPaused: state.timerPaused,
      }),
    }
  )
)
