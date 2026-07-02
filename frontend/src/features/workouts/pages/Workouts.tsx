import React, { Suspense, useState } from 'react'
import { 
  useExercisesQuery, 
  useWorkoutsHistoryQuery, 
  useStartWorkoutMutation, 
  useAddExerciseMutation,
  useSeedExercisesMutation
} from '../api/workoutsApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/store/useUIStore'
import { toast } from 'sonner'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Dumbbell, Calendar, Play, Plus, BookOpen, Clock, History, FolderOpen, Search } from 'lucide-react'

const MuscleGroup3D = React.lazy(() => import('../components/MuscleGroup3D').then((module) => ({ default: module.MuscleGroup3D })))

export const Workouts: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'catalog'

  const { activeWorkoutId, setActiveWorkout, resetTimer } = useUIStore()
  
  const [selectedMuscle, setSelectedMuscle] = useState('')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')

  // Sync with URL query parameter
  React.useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams, searchQuery])

  // Queries
  const { data: exercisesPage, isLoading: exercisesLoading } = useExercisesQuery(selectedMuscle)
  const { data: workoutsPage, isLoading: historyLoading } = useWorkoutsHistoryQuery(15)

  // Mutations
  const startWorkoutMutation = useStartWorkoutMutation(() => {
    toast.success('Workout session started! Add exercises below.')
    navigate('/workouts/active')
  })

  const addExerciseMutation = useAddExerciseMutation(() => {
    toast.success('Exercise added to current workout session!')
    navigate('/workouts/active')
  })

  const seedExercisesMutation = useSeedExercisesMutation((data) => {
    toast.success(`Seeding successful! Added ${data.count} exercises.`)
  })

  const handleStartSession = () => {
    startWorkoutMutation.mutate()
  }

  const setTab = (tabName: string) => {
    setSearchParams({ tab: tabName })
  }

  // Filter exercises client side on name search
  const exercises = exercisesPage?.content?.filter((e: any) => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Title & Active Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Workouts</h1>
          <p className="text-slate-650 dark:text-slate-400 mt-1">Start training, explore custom exercise logs, and check your history.</p>
        </div>
        {!activeWorkoutId ? (
          <Button
            variant="neon"
            className="flex items-center space-x-2"
            onClick={handleStartSession}
            disabled={startWorkoutMutation.isPending}
          >
            <Play className="h-4 w-4 fill-black" />
            <span>{startWorkoutMutation.isPending ? 'Starting...' : 'Start Empty Workout'}</span>
          </Button>
        ) : (
          <Button
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            onClick={() => navigate('/workouts/active')}
          >
            <span>Resume Current Session</span>
          </Button>
        )}
      </div>

      {/* Section-Specific Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/10 dark:border-white/10 pb-2 gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setTab('catalog')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Exercise Catalog</span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Workout History</span>
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="relative w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Search exercise catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 text-xs h-9 bg-white/50 dark:bg-slate-900/50 border border-black/10 dark:border-white/10 rounded-full focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30 text-slate-800 dark:text-slate-200 transition-all duration-300 shadow-sm"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        )}
      </div>

      {/* Tab Contents: Exercise Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-8">
          
          {/* R3F 3D Torso Filter & Selection Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Suspense
                fallback={
                  <div className="h-[325px] rounded-xl border border-cyan-500/10 bg-slate-100/40 dark:bg-slate-900/40 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    Loading muscle filter...
                  </div>
                }
              >
                <MuscleGroup3D
                  selectedMuscle={selectedMuscle}
                  onSelectMuscle={(m) => setSelectedMuscle(m === selectedMuscle ? '' : m)}
                />
              </Suspense>
              <div className="flex flex-wrap gap-2">
                {['Chest', 'Back', 'Arms', 'Shoulders', 'Legs'].map((muscle) => (
                  <Button
                    key={muscle}
                    variant={selectedMuscle === muscle ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedMuscle(selectedMuscle === muscle ? '' : muscle)}
                  >
                    {muscle}
                  </Button>
                ))}
                {selectedMuscle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => setSelectedMuscle('')}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>

            {/* Info card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Training Catalog</span>
                </CardTitle>
                <CardDescription>Explore seeded physical exercises</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-400 text-sm space-y-4">
                <p>Seeded workouts and exercises contain detailed instructions on muscle targeting and execution.</p>
                <div className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-lg border border-black/5 dark:border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">Gym Tip:</span>
                  <p className="text-xs text-slate-650 dark:text-slate-400">Target muscle groups using various compounds and isolates. Drag/rotate the model to examine target points.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Exercises List & Search */}
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Exercise Directory</h2>
            </div>

            {exercisesLoading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading exercise database...</div>
            ) : exercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((ex: any) => (
                  <Card key={ex.id} className="hover:border-cyan-500/20 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-white">{ex.name}</CardTitle>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-black/5 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {ex.muscleGroup}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                        Equipment: {ex.equipment || 'Bodyweight'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{ex.description}</p>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-end">
                      {activeWorkoutId ? (
                        <Button
                          size="sm"
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                          onClick={() => addExerciseMutation.mutate(ex.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Session
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
                          onClick={() => {
                            startWorkoutMutation.mutate(undefined, {
                              onSuccess: (data) => {
                                resetTimer()
                                setActiveWorkout(data.id, data.note || `Session #${data.id.substring(0, 4)}`)
                                addExerciseMutation.mutate(ex.id)
                              }
                            })
                          }}
                        >
                          Start Session with this
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 dark:text-slate-400 text-sm py-12 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl flex flex-col items-center justify-center gap-4">
                <p>No exercises found in the catalog.</p>
                {!selectedMuscle && !searchQuery && (
                  <div className="max-w-md space-y-3">
                    <p className="text-xs text-slate-400">Your exercises database appears to be empty. Seed the default library to get started.</p>
                    <Button 
                      onClick={() => seedExercisesMutation.mutate()} 
                      disabled={seedExercisesMutation.isPending}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                    >
                      {seedExercisesMutation.isPending ? 'Seeding Library...' : 'Seed Exercises Library'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Workout History Tab */}
      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recorded Workouts History</h2>
          
          {historyLoading ? (
            <div className="text-slate-500 dark:text-slate-400 text-center py-8">Loading history...</div>
          ) : workoutsPage?.content && workoutsPage.content.length > 0 ? (
            <div className="space-y-4">
              {workoutsPage.content.map((w: any) => (
                <Card key={w.id} className="border-slate-200/50 dark:border-white/5 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(w.startTime).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      w.status === 'COMPLETED' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15'
                          : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/15'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-slate-800 dark:text-white mt-1">
                      {w.note || 'Workout Session'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-500 dark:text-slate-400 pb-3">
                    <div className="flex space-x-4 mb-2">
                      <span className="flex items-center">
                        <Dumbbell className="h-3.5 w-3.5 mr-1 text-cyan-600 dark:text-cyan-400" />
                        {w.exercises?.length || 0} Exercises
                      </span>
                      {w.endTime && (
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                          {Math.round((new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / 60000)} mins
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {w.exercises?.map((we: any) => we.exerciseName).join(', ')}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="text-xs text-cyan-600 dark:text-cyan-400 p-0 font-semibold"
                      onClick={() => navigate(`/workouts/${w.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 dark:text-slate-400 text-sm py-12 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
              No recorded sessions yet. Get active!
            </div>
          )}
        </div>
      )}

    </div>
  )
}
