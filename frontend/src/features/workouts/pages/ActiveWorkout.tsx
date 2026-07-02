import React, { useState, useEffect } from 'react'
import { useWorkoutDetailQuery, useAddSetMutation, useUpdateSetMutation, useFinishWorkoutMutation } from '../api/workoutsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useUIStore } from '@/store/useUIStore'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { 
  Check, 
  Plus, 
  Clock, 
  Dumbbell, 
  ArrowLeft 
} from 'lucide-react'

export const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate()
  const { activeWorkoutId, workoutTime } = useUIStore()

  const [workoutNote, setWorkoutNote] = useState('Log Details')

  // Redirect to Workouts if no active session
  useEffect(() => {
    if (!activeWorkoutId) {
      navigate('/workouts')
    }
  }, [activeWorkoutId, navigate])

  // Queries
  const { data: workout, isLoading } = useWorkoutDetailQuery(activeWorkoutId || undefined)

  // Mutations
  const addSetMutation = useAddSetMutation(() => {
    toast.success('Set added!')
  })

  const updateSetMutation = useUpdateSetMutation()

  const finishWorkoutMutation = useFinishWorkoutMutation(() => {
    toast.success('Workout completed and saved to history!')
    navigate('/workouts')
  })

  const handleAddSet = (workoutExerciseId: string, setsCount: number) => {
    addSetMutation.mutate({
      workoutExerciseId,
      setRequest: {
        setNumber: setsCount + 1,
        weightKg: 60.0,
        reps: 10,
        rpe: 8,
        completed: false,
      },
    })
  }

  const handleUpdateSetField = (setId: string, currentSet: any, field: string, value: any) => {
    const updateRequest = {
      weightKg: currentSet.weightKg,
      reps: currentSet.reps,
      rpe: currentSet.rpe,
      completed: currentSet.completed,
      ...{ [field]: value },
    }
    updateSetMutation.mutate({ setId, updateRequest })
  }

  const handleToggleComplete = (setId: string, currentSet: any) => {
    const nextCompleted = !currentSet.completed
    handleUpdateSetField(setId, currentSet, 'completed', nextCompleted)
    if (nextCompleted) {
      toast.success('Set completed!', { duration: 1000 })
    }
  }

  const handleFinish = () => {
    finishWorkoutMutation.mutate(workoutNote)
  }

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

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400 text-sm">
        Opening workout session...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Upper header */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
          onClick={() => navigate('/workouts')}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Directory
        </Button>
        <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-lg">
          <Clock className="h-5 w-5 animate-pulse" />
          <span>{formatTimer(workoutTime)}</span>
        </div>
      </div>

      {/* Title / Note */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Current Session</span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Active Gym Tracker</h1>
          </div>
          <Button
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6"
            onClick={handleFinish}
            disabled={finishWorkoutMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            Finish Workout
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="workoutNote">Session Notes / Focus</Label>
          <Input
            id="workoutNote"
            value={workoutNote}
            onChange={(e) => setWorkoutNote(e.target.value)}
            placeholder="e.g. Chest & Triceps Push Day"
          />
        </div>
      </div>

      {/* Exercises Log Panels */}
      <div className="space-y-6">
        {workout?.exercises && workout.exercises.length > 0 ? (
          workout.exercises.map((we: any) => (
            <Card key={we.id} className="border-slate-200/50 dark:border-white/5 hover:border-cyan-500/20 transition-all duration-300 shadow-md">
              <CardHeader className="pb-3 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                    <Dumbbell className="h-5 w-5 mr-2 text-cyan-500 dark:text-cyan-400" />
                    {we.exerciseName}
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => handleAddSet(we.id, we.sets?.length || 0)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Set
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 text-left">
                        <th className="py-2 font-semibold">Set</th>
                        <th className="py-2 font-semibold">Weight (kg)</th>
                        <th className="py-2 font-semibold">Reps</th>
                        <th className="py-2 font-semibold">RPE</th>
                        <th className="py-2 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {we.sets?.map((set: any, idx: number) => (
                        <tr 
                          key={set.id} 
                          className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                            set.completed ? 'bg-emerald-500/5 dark:bg-emerald-500/5' : ''
                          }`}
                        >
                          <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {idx + 1}
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                              value={set.weightKg}
                              onChange={(e) => 
                                handleUpdateSetField(set.id, set, 'weightKg', parseFloat(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                              value={set.reps}
                              onChange={(e) => 
                                handleUpdateSetField(set.id, set, 'reps', parseInt(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white font-mono text-center focus:outline-none focus:border-cyan-500/50"
                              value={set.rpe || 8}
                              onChange={(e) => 
                                handleUpdateSetField(set.id, set, 'rpe', parseInt(e.target.value) || 8)
                              }
                            />
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => handleToggleComplete(set.id, set)}
                              className={`w-7 h-7 rounded-full border flex items-center justify-center mx-auto transition-all ${
                                set.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-black'
                                  : 'border-black/20 dark:border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-transparent hover:text-cyan-400'
                              }`}
                            >
                              <Check className="h-4 w-4 stroke-[3]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-white/10 rounded-2xl">
            <Dumbbell className="h-10 w-10 text-slate-500 mb-2 animate-bounce" />
            No exercises added to this session yet.
            <Button
              variant="link"
              className="text-cyan-400 mt-1"
              onClick={() => navigate('/workouts')}
            >
              Browse and add exercises
            </Button>
          </div>
        )}
      </div>

      {/* Add more exercise prompt */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="border-dashed border-white/10 text-slate-400 hover:text-white"
          onClick={() => navigate('/workouts')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Exercise
        </Button>
      </div>

    </div>
  )
}
