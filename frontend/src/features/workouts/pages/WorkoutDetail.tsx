import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkoutDetailQuery } from '../api/workoutsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Clock, Dumbbell, Calendar, CheckCircle } from 'lucide-react'

export const WorkoutDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: w, isLoading } = useWorkoutDetailQuery(id)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400 text-sm">
        Loading workout details...
      </div>
    )
  }

  if (!w) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Workout not found.</p>
        <Button variant="link" onClick={() => navigate('/workouts')}>Back to Workouts</Button>
      </div>
    )
  }

  const durationMins = w.endTime 
    ? Math.round((new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / 60000)
    : 0

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
          onClick={() => navigate('/workouts')}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Workouts
        </Button>
      </div>

      {/* Detail Header */}
      <Card className="border-slate-200/50 dark:border-cyan-500/10">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Recorded Workout Summary</span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{w.note || 'Finished Session'}</h1>
            </div>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
              {w.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-300 border-t border-black/5 dark:border-white/5 pt-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>{new Date(w.startTime).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>Duration: {durationMins} minutes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Exercises logged: {w.exercises?.length || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Exercises Logged */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Exercise Breakdown</h2>
        {w.exercises?.map((we: any, idx: number) => (
          <Card key={we.id} className="border-slate-200/50 dark:border-white/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center">
                <span className="text-slate-500 font-mono mr-2">{String(idx + 1).padStart(2, '0')}.</span>
                {we.exerciseName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-2">
                {we.sets?.map((set: any, sIdx: number) => (
                  <div 
                    key={set.id} 
                    className="flex justify-between items-center py-2 px-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg text-sm"
                  >
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">Set {sIdx + 1}</span>
                    <div className="flex space-x-6">
                      <span className="text-slate-600 dark:text-slate-300">Weight: <span className="font-mono font-bold text-slate-800 dark:text-white">{set.weightKg} kg</span></span>
                      <span className="text-slate-600 dark:text-slate-300">Reps: <span className="font-mono font-bold text-slate-800 dark:text-white">{set.reps}</span></span>
                      <span className="text-slate-600 dark:text-slate-300">RPE: <span className="font-mono font-bold text-slate-800 dark:text-white">{set.rpe || 8}</span></span>
                    </div>
                    {set.completed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Incomplete</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
