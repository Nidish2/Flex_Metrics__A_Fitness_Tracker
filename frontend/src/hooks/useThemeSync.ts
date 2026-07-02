import { useEffect } from 'react'
import { useUIStore } from '../store/useUIStore'

export const useThemeSync = () => {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])
}
