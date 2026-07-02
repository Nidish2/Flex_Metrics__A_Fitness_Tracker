import { useEffect } from 'react'
import { useUIStore } from '../store/useUIStore'

export const useWorkoutTimer = () => {
  const { activeWorkoutId, timerPaused, incrementTimer } = useUIStore()

  useEffect(() => {
    let timer: any = null
    if (activeWorkoutId && !timerPaused) {
      timer = setInterval(() => {
        incrementTimer()
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [activeWorkoutId, timerPaused, incrementTimer])
}
