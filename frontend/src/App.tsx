import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/useAuthStore'
import { useUIStore } from './store/useUIStore'

// Layout & Pages
import { MainLayout } from './components/MainLayout'
import { Login } from './features/auth/pages/Login'
import { Register } from './features/auth/pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Workouts } from './features/workouts/pages/Workouts'
import { ActiveWorkout } from './features/workouts/pages/ActiveWorkout'
import { WorkoutDetail } from './features/workouts/pages/WorkoutDetail'
import { Nutrition } from './features/nutrition/pages/Nutrition'
import { Profile } from './features/profile/pages/Profile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public-only Route Guard
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function App() {
  const theme = useUIStore((state) => state.theme)
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main Layout Wrap (Shares Header and Footer across ALL pages) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Public Pages */}
            <Route 
              path="login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected Pages */}
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
            <Route path="workouts/active" element={<ProtectedRoute><ActiveWorkout /></ProtectedRoute>} />
            <Route path="workouts/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
            <Route path="nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast notifications container */}
      <Toaster position="top-right" theme={theme} closeButton richColors />
    </QueryClientProvider>
  )
}

export default App

