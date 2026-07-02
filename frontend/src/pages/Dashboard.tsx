import React, { useState } from 'react'
import { useProfileQuery, useBodyMetricsQuery, useLogMetricMutation } from '../features/profile/api/profileApi'
import { useNutritionSummaryQuery } from '../features/nutrition/api/nutritionApi'
import { useWorkoutsHistoryQuery, useStartWorkoutMutation } from '../features/workouts/api/workoutsApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { 
  Dumbbell, 
  Scale, 
  Flame, 
  Plus, 
  TrendingUp, 
  Calendar,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/useUIStore'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const theme = useUIStore((state) => state.theme)

  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  // Queries
  const { data: profile } = useProfileQuery()
  const { data: nutritionSummary } = useNutritionSummaryQuery(todayStr)
  const { data: metricsPage } = useBodyMetricsQuery(15)
  const { data: workoutsPage } = useWorkoutsHistoryQuery(5)

  // Mutations
  const addMetricMutation = useLogMetricMutation(() => {
    toast.success('Body metric logged successfully!')
    setWeight('')
    setBodyFat('')
  })

  const startWorkoutMutation = useStartWorkoutMutation(() => {
    toast.success('Workout session started!')
    navigate('/workouts/active')
  })

  const handleMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight) return
    addMetricMutation.mutate({
      weightKg: parseFloat(weight),
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
    })
  }

  // Formatting chart data
  const metricsData = metricsPage?.content
    ?.map((m: any) => ({
      date: new Date(m.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: m.weightKg,
      fat: m.bodyFatPercentage || null,
      rawDate: new Date(m.loggedAt),
    }))
    .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime()) || []

  const calConsumed = nutritionSummary?.totalCalories || 0
  const calGoal = nutritionSummary?.calorieGoal || profile?.dailyCalorieGoal || 2000
  const calPercent = Math.min(Math.round((calConsumed / calGoal) * 100), 100)

  const macrosData = [
    {
      name: 'Protein (g)',
      Logged: Math.round(nutritionSummary?.totalProtein || 0),
      Target: nutritionSummary?.proteinGoal || profile?.dailyProteinGoal || 150,
    },
    {
      name: 'Carbs (g)',
      Logged: Math.round(nutritionSummary?.totalCarbs || 0),
      Target: nutritionSummary?.carbsGoal || profile?.dailyCarbsGoal || 200,
    },
    {
      name: 'Fat (g)',
      Logged: Math.round(nutritionSummary?.totalFat || 0),
      Target: nutritionSummary?.fatGoal || profile?.dailyFatGoal || 70,
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track your growth, macros, and workout sessions.</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="neon"
            className="flex items-center space-x-2"
            onClick={() => startWorkoutMutation.mutate()}
          >
            <Dumbbell className="h-4 w-4" />
            <span>Start Session</span>
          </Button>
          <Button
            variant="glass"
            className="flex items-center space-x-2"
            onClick={() => navigate('/nutrition')}
          >
            <Plus className="h-4 w-4" />
            <span>Log Meal</span>
          </Button>
        </div>
      </div>

      {/* Metric Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-cyan-500/10">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Calories Today</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{calConsumed} / {calGoal} kcal</div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${calPercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <Flame className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Current Weight</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {metricsData[metricsData.length - 1]?.weight || '--'} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">kg</span>
              </div>
              <p className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center mt-2">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                {metricsData.length > 1 
                  ? `${(metricsData[metricsData.length - 1].weight - metricsData[0].weight).toFixed(1)} kg overall change`
                  : 'Log weight to see trends'}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Scale className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/10">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Workouts Logged</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {workoutsPage?.totalElements || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">All-time finished sessions</p>
            </div>
            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <Zap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weight Tracker Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Body Weight Trend</CardTitle>
            <CardDescription>Track your weight changes over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {metricsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', 
                      color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                      borderRadius: '12px',
                      fontSize: '11px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    name="Weight (kg)" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                No weight metrics logged yet. Log your weight to see charts.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Log Form */}
        <Card>
          <CardHeader>
            <CardTitle>Log Metrics</CardTitle>
            <CardDescription>Update your body stats</CardDescription>
          </CardHeader>
          <form onSubmit={handleMetricSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 78.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyFat">Body Fat (%)</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 15.4"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                disabled={addMetricMutation.isPending}
              >
                {addMetricMutation.isPending ? 'Logging...' : 'Save Metric'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Macronutrient Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Macronutrients</CardTitle>
            <CardDescription>Nutrition intake compared to target goals</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={macrosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0', 
                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Logged" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your last recorded activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workoutsPage?.content && workoutsPage.content.length > 0 ? (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {workoutsPage.content.map((w: any) => (
                  <div key={w.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 p-2 rounded-lg">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                          {w.note || `Workout Session`}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(w.startTime).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      w.status === 'COMPLETED' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400 text-sm text-center">
                <Dumbbell className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                No workout sessions logged yet.
                <Button 
                  variant="link" 
                  className="text-cyan-600 dark:text-cyan-400 mt-1 font-semibold" 
                  onClick={() => startWorkoutMutation.mutate()}
                >
                  Start your first session now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
