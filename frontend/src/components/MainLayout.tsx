import React, { useState, useEffect, memo } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { Button } from './ui/Button'
import { Logo } from './ui/Logo'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/config/apiClient'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Dumbbell, 
  LayoutDashboard, 
  Apple, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Compass,
  History,
  Activity,
  BookOpen,
  Play,
  Pause,
  PlusCircle,
  ClipboardList,
  Square
} from 'lucide-react'

import { useThemeSync } from '../hooks/useThemeSync'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'

export const MainLayout: React.FC = () => {
  // Drive theme & timer sync at root layout level
  useThemeSync()
  useWorkoutTimer()

  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const activeWorkoutId = useUIStore((state) => state.activeWorkoutId)
  const activeWorkoutName = useUIStore((state) => state.activeWorkoutName)
  const timerPaused = useUIStore((state) => state.timerPaused)
  const togglePauseTimer = useUIStore((state) => state.togglePauseTimer)
  const resetTimer = useUIStore((state) => state.resetTimer)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Sub-navigation expansion states for Sidebar
  const [workoutsExpanded, setWorkoutsExpanded] = useState(true)
  const [nutritionExpanded, setNutritionExpanded] = useState(true)

  // Header active dropdown state: 'workouts' | 'nutrition' | null
  const [activeDropdown, setActiveDropdown] = useState<'workouts' | 'nutrition' | null>(null)

  // Synchronize actual user profile name from database dynamically
  useEffect(() => {
    if (isAuthenticated && token) {
      apiClient.get('/api/v1/profile')
        .then((res) => {
          if (res.data && res.data.heightCm !== undefined) {
            const name = `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim() || 'Athlete'
            useAuthStore.setState((state) => ({
              user: {
                ...state.user,
                name,
                email: res.data.email || state.user?.email || '',
              }
            }))
          }
        })
        .catch((err) => {
          console.error('Failed to sync profile name:', err)
        })
    }
  }, [isAuthenticated, token, user])

  // End / Finish Workout Mutation directly from floating banner
  const finishWorkoutMutation = useMutation({
    mutationFn: async () => {
      if (!activeWorkoutId) return
      const res = await apiClient.post(`/api/v1/workouts/${activeWorkoutId}/finish`, {
        note: 'Completed Workout Session',
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Workout completed and saved to history!')
      resetTimer()
      queryClient.invalidateQueries({ queryKey: ['workoutsHistory'] })
      navigate('/workouts?tab=history')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to finish workout')
    },
  })

  const handleLogout = () => {
    logout()
    toast.success('Successfully logged out. See you next workout!', {
      icon: '👋',
    })
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      
      {/* Top Header - Responsive & Spanning Full Width */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-950/60 bg-gradient-to-r from-cyan-500/5 via-emerald-500/5 to-transparent dark:from-cyan-500/10 dark:via-emerald-500/10 dark:to-transparent backdrop-blur-md relative transition-all duration-350">
        {/* Bottom border blue-green brand shades highlights */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />
        
        <div className="w-full px-4 md:px-10 h-16 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size={36} className="text-primary" />
            <span className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-cyan-500 to-emerald-400 bg-clip-text text-transparent uppercase font-mono">
              FLEX METRICS
            </span>
          </div>

          {/* Header Horizontal Navigation Links (Desktop only) */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-6">
              
              {/* 1. Dashboard Link */}
              <Link 
                to="/dashboard"
                className={`flex items-center space-x-1.5 text-sm font-bold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                  location.pathname === '/dashboard' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              {/* 2. Workouts Section Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'workouts' ? null : 'workouts')}
                  className={`flex items-center space-x-1.5 text-sm font-bold hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer ${
                    location.pathname.startsWith('/workouts') ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Dumbbell className="h-4 w-4 text-cyan-500" />
                  <span>Workouts</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'workouts' && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute left-0 mt-2 w-48 rounded-xl glass-panel bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 p-1.5 shadow-xl z-20"
                      >
                        <Link
                          to="/workouts?tab=catalog"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                          <span>Exercise Catalog</span>
                        </Link>
                        <Link
                          to="/workouts?tab=history"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                        >
                          <History className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                          <span>Workout History</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Nutrition Section Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'nutrition' ? null : 'nutrition')}
                  className={`flex items-center space-x-1.5 text-sm font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer ${
                    location.pathname.startsWith('/nutrition') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Apple className="h-4 w-4 text-emerald-500" />
                  <span>Nutrition</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'nutrition' && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute left-0 mt-2 w-48 rounded-xl glass-panel bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 p-1.5 shadow-xl z-20"
                      >
                        <Link
                          to="/nutrition?tab=logger"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                        >
                          <ClipboardList className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Daily Food Log</span>
                        </Link>
                        <Link
                          to="/nutrition?tab=add"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Log New Meal</span>
                        </Link>
                        <Link
                          to="/nutrition?tab=charts"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Activity className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Macro Analysis</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Profile Link */}
              <Link 
                to="/profile"
                className={`flex items-center space-x-1.5 text-sm font-bold transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${
                  location.pathname === '/profile' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

            </nav>
          )}

          {/* User Panel & Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Smooth Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all active:scale-95 cursor-pointer relative overflow-hidden"
              aria-label="Toggle Theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-cyan-400" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
              </motion.div>
            </button>

            {/* Desktop User Panel - Grouped in a sleek glass capsule container */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1.5 rounded-full shadow-sm hover:border-black/20 dark:hover:border-white/20 transition-all duration-300">
                <div className="flex items-center space-x-2 pl-2.5 pr-1">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-400 flex items-center justify-center text-[10px] font-black text-slate-950 uppercase shadow-sm">
                    {user?.name ? user.name.charAt(0) : 'A'}
                  </div>
                  <span className="text-xs text-slate-700 dark:text-slate-350">
                    Hi, <span className="font-extrabold text-slate-900 dark:text-white">{user?.name || 'Athlete'}</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 border border-transparent rounded-full px-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Sign Out
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white focus:outline-none"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drop-down Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-30 glass-panel border-b border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 py-4 px-6 space-y-3 animate-in fade-in slide-in-from-top-5">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold ${
              location.pathname === '/dashboard'
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          
          {/* Workouts with tabs directly */}
          <div className="space-y-1 pl-4 border-l-2 border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workouts</span>
            <Link
              to="/workouts?tab=catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-2 py-2 text-sm font-semibold text-slate-705 dark:text-slate-300"
            >
              <Dumbbell className="h-4 w-4 text-cyan-500" />
              <span>Exercise Catalog</span>
            </Link>
            <Link
              to="/workouts?tab=history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-2 py-2 text-sm font-semibold text-slate-705 dark:text-slate-300"
            >
              <History className="h-4 w-4" />
              <span>Workout History</span>
            </Link>
          </div>

          {/* Nutrition with tabs directly */}
          <div className="space-y-1 pl-4 border-l-2 border-black/5 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nutrition</span>
            <Link
              to="/nutrition?tab=logger"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-2 py-2 text-sm font-semibold text-slate-705 dark:text-slate-300"
            >
              <ClipboardList className="h-4 w-4 text-emerald-500" />
              <span>Daily Food Log</span>
            </Link>
            <Link
              to="/nutrition?tab=add"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-2 py-2 text-sm font-semibold text-slate-705 dark:text-slate-300"
            >
              <PlusCircle className="h-4 w-4 text-emerald-500" />
              <span>Log New Meal</span>
            </Link>
            <Link
              to="/nutrition?tab=charts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-2 py-2 text-sm font-semibold text-slate-705 dark:text-slate-300"
            >
              <Activity className="h-4 w-4" />
              <span>Macro Analysis</span>
            </Link>
          </div>

          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold ${
              location.pathname === '/profile'
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>

          <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-300 font-bold">{user?.name || 'Athlete'}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Main Container - Fullscreen optimization */}
      <div className="flex-grow flex w-full px-4 md:px-10 py-6 gap-6 transition-all duration-300">
        
        {/* Left Sidebar (Desktop Navigation) - Collapsible & Sub-nav dropdown trees */}
        {isAuthenticated && (
          <aside className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}>
            <div className="sticky top-24 glass-panel border border-black/5 dark:border-white/5 rounded-2xl p-4 space-y-4">
              
              {/* Sidebar Header with Toggler */}
              <div className={`flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 ${sidebarCollapsed ? 'flex-col space-y-2' : ''}`}>
                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-2">
                    <Compass className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                      Navigation
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-cyan-500 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/10 cursor-pointer"
                  title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </div>

              {/* Sidebar Navigation Links */}
              <nav className="space-y-1">
                {/* 1. Dashboard (Simple Link) */}
                <Link
                  to="/dashboard"
                  className={`flex items-center rounded-xl text-sm font-bold transition-all duration-200 ${
                    sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                  } ${
                    location.pathname === '/dashboard'
                      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </Link>

                {/* 2. Workouts Section (With Dropdown Sub-menu) */}
                <div className="space-y-0.5">
                  <div
                    onClick={() => {
                      if (sidebarCollapsed) {
                        setSidebarCollapsed(false)
                      }
                      setWorkoutsExpanded(!workoutsExpanded)
                    }}
                    className={`flex items-center justify-between rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      sidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3'
                    } ${
                      location.pathname.startsWith('/workouts')
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Dumbbell className="h-4 w-4 shrink-0 text-cyan-500" />
                      {!sidebarCollapsed && <span>Workouts</span>}
                    </div>
                    {!sidebarCollapsed && (
                      workoutsExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>

                  {/* Expanded Sub-tabs inside Sidebar */}
                  {!sidebarCollapsed && workoutsExpanded && (
                    <div className="pl-6 space-y-0.5 mt-0.5 border-l-2 border-cyan-500/20 ml-6 animate-in slide-in-from-left-2 duration-200">
                      <Link
                        to="/workouts?tab=catalog"
                        className={`flex items-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold ${
                          location.pathname === '/workouts' && location.search.includes('tab=catalog')
                            ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Exercise Catalog</span>
                      </Link>
                      <Link
                        to="/workouts?tab=history"
                        className={`flex items-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold ${
                          location.pathname === '/workouts' && location.search.includes('tab=history')
                            ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <History className="h-3 w-3" />
                        <span>Workout History</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Nutrition Section (With Dropdown Sub-menu) */}
                <div className="space-y-0.5">
                  <div
                    onClick={() => {
                      if (sidebarCollapsed) {
                        setSidebarCollapsed(false)
                      }
                      setNutritionExpanded(!nutritionExpanded)
                    }}
                    className={`flex items-center justify-between rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      sidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3'
                    } ${
                      location.pathname.startsWith('/nutrition')
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Apple className="h-4 w-4 shrink-0 text-emerald-500" />
                      {!sidebarCollapsed && <span>Nutrition</span>}
                    </div>
                    {!sidebarCollapsed && (
                      nutritionExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>

                  {/* Expanded Sub-tabs inside Sidebar */}
                  {!sidebarCollapsed && nutritionExpanded && (
                    <div className="pl-6 space-y-0.5 mt-0.5 border-l-2 border-emerald-500/20 ml-6 animate-in slide-in-from-left-2 duration-200">
                      <Link
                        to="/nutrition?tab=logger"
                        className={`flex items-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold ${
                          location.pathname === '/nutrition' && (location.search.includes('tab=logger') || !location.search)
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <ClipboardList className="h-3 w-3" />
                        <span>Daily Food Log</span>
                      </Link>
                      <Link
                        to="/nutrition?tab=add"
                        className={`flex items-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold ${
                          location.pathname === '/nutrition' && location.search.includes('tab=add')
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <PlusCircle className="h-3 w-3" />
                        <span>Log New Meal</span>
                      </Link>
                      <Link
                        to="/nutrition?tab=charts"
                        className={`flex items-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold ${
                          location.pathname === '/nutrition' && location.search.includes('tab=charts')
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Activity className="h-3 w-3" />
                        <span>Macro Analysis</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Profile Link */}
                <Link
                  to="/profile"
                  className={`flex items-center rounded-xl text-sm font-bold transition-all duration-200 ${
                    sidebarCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                  } ${
                    location.pathname === '/profile'
                      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>Profile</span>}
                </Link>
              </nav>
            </div>
          </aside>
        )}

        {/* Content Area - Centers unauthenticated cards (Login/Register) */}
        <div className={`flex-grow flex flex-col min-w-0 ${!isAuthenticated ? 'items-center justify-center' : ''}`}>
          <main className="flex-grow pb-12 w-full">
            <Outlet />
          </main>
        </div>

      </div>

      {/* Edge-to-Edge Premium Highlighted Footer Band */}
      <footer className="w-full border-t border-black/5 dark:border-white/10 py-8 bg-slate-100/50 dark:bg-slate-950/40 text-center relative overflow-hidden transition-colors duration-300">
        {/* Top border blue-green brand shades highlights */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="w-full px-4 md:px-10 flex flex-col items-center justify-center space-y-4 relative z-10">
          <div className="flex items-center space-x-3 bg-white/50 dark:bg-black/25 px-5 py-2 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
            <Logo size={28} className="text-primary animate-pulse" />
            <span className="font-extrabold uppercase text-base tracking-widest bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-600 bg-clip-text text-transparent font-mono">
              FLEX METRICS
            </span>
          </div>
          <p className="text-xs font-semibold tracking-wide text-slate-650 dark:text-slate-300 font-sans max-w-md">
            Empowering your ultimate athletic progression with high-performance metrics.
          </p>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider pt-2 border-t border-black/5 dark:border-white/5 w-64 mx-auto">
            © 2026 Flex Metrics Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Active Workout Floating Banner with Pause & Finish Controls */}
      {isAuthenticated && activeWorkoutId && (
        <ActiveWorkoutBanner
          activeWorkoutName={activeWorkoutName}
          timerPaused={timerPaused}
          onTogglePause={togglePauseTimer}
          onFinish={() => finishWorkoutMutation.mutate()}
          isFinishing={finishWorkoutMutation.isPending}
        />
      )}

      {/* Mobile Bottom Navigation (Only visible if logged in) */}
      {isAuthenticated && (
        <div className="md:hidden sticky bottom-0 z-30 w-full glass-panel border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex justify-around py-2">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center p-2 text-[10px] font-bold transition-all ${
              location.pathname === '/dashboard' 
                ? 'text-cyan-500 dark:text-cyan-400 scale-105' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mb-0.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/workouts?tab=catalog"
            className={`flex flex-col items-center p-2 text-[10px] font-bold transition-all ${
              location.pathname.startsWith('/workouts') 
                ? 'text-cyan-500 dark:text-cyan-400 scale-105' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Dumbbell className="h-5 w-5 mb-0.5" />
            <span>Workouts</span>
          </Link>
          <Link
            to="/nutrition?tab=logger"
            className={`flex flex-col items-center p-2 text-[10px] font-bold transition-all ${
              location.pathname.startsWith('/nutrition') 
                ? 'text-cyan-500 dark:text-cyan-400 scale-105' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Apple className="h-5 w-5 mb-0.5" />
            <span>Nutrition</span>
          </Link>
          <Link
            to="/profile"
            className={`flex flex-col items-center p-2 text-[10px] font-bold transition-all ${
              location.pathname === '/profile' 
                ? 'text-cyan-500 dark:text-cyan-400 scale-105' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <User className="h-5 w-5 mb-0.5" />
            <span>Profile</span>
          </Link>
        </div>
      )}
    </div>
  )
}

const ActiveWorkoutBanner = memo(function ActiveWorkoutBanner({
  activeWorkoutName,
  timerPaused,
  onTogglePause,
  onFinish,
  isFinishing,
}: {
  activeWorkoutName: string | null
  timerPaused: boolean
  onTogglePause: () => void
  onFinish: () => void
  isFinishing: boolean
}) {
  const workoutTime = useUIStore((state) => state.workoutTime)

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ].filter(Boolean).join(':')
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-950/90 border-t border-cyan-500/20 backdrop-blur-lg py-3.5 px-4 shadow-lg animate-in slide-in-from-bottom-10">
      <div className="w-full px-4 md:px-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`h-2.5 w-2.5 rounded-full bg-cyan-400 ${timerPaused ? '' : 'animate-ping'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-extrabold">Active Gym Session</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">{activeWorkoutName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={onTogglePause}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors border border-black/10 dark:border-white/10 cursor-pointer shadow-sm"
            title={timerPaused ? 'Resume Session Timer' : 'Pause Session Timer'}
          >
            {timerPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>

          <div className="text-slate-800 dark:text-slate-200 font-mono text-lg font-extrabold">
            {formatTimer(workoutTime)}
          </div>

          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-wide"
            onClick={onFinish}
            disabled={isFinishing}
          >
            <Square className="h-3.5 w-3.5 mr-1.5 fill-slate-950" />
            Finish Workout
          </Button>
        </div>
      </div>
    </div>
  )
})
