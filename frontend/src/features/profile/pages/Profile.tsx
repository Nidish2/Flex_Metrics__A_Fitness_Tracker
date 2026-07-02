import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  useProfileQuery, 
  useBodyMetricsQuery, 
  useUpdateProfileMutation, 
  useLogMetricMutation 
} from '../api/profileApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { toast } from 'sonner'
import { User, Goal } from 'lucide-react'

const profileSchema = z.object({
  heightCm: z.number().positive({ message: 'Height must be positive' }),
  weightKg: z.number().positive({ message: 'Weight must be positive' }).optional(),
  birthDate: z.string().min(1, { message: 'Birth date is required' }),
  biologicalSex: z.string().min(1, { message: 'Biological sex is required' }),
  activityLevel: z.string().min(1, { message: 'Activity level is required' }),
  dailyCalorieGoal: z.number().min(500, { message: 'Goal must be at least 500 kcal' }),
  dailyProteinGoal: z.number().min(0, { message: 'Cannot be negative' }),
  dailyCarbsGoal: z.number().min(0, { message: 'Cannot be negative' }),
  dailyFatGoal: z.number().min(0, { message: 'Cannot be negative' }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export const Profile: React.FC = () => {
  // 1. Fetch user profile
  const { data: profile, isLoading: isProfileLoading } = useProfileQuery()

  // 2. Fetch latest body metrics for weight seed
  const { data: metricsPage, isLoading: isMetricsLoading } = useBodyMetricsQuery(1)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      heightCm: 175,
      weightKg: 70,
      birthDate: '',
      biologicalSex: 'MALE',
      activityLevel: 'MODERATE',
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyCarbsGoal: 200,
      dailyFatGoal: 70,
    },
  })

  // Load backend profile DTO details
  useEffect(() => {
    if (profile) {
      setValue('heightCm', profile.heightCm)
      setValue('birthDate', profile.birthDate)
      setValue('biologicalSex', profile.biologicalSex)
      setValue('activityLevel', profile.activityLevel)
      setValue('dailyCalorieGoal', profile.dailyCalorieGoal)
      setValue('dailyProteinGoal', profile.dailyProteinGoal || 150)
      setValue('dailyCarbsGoal', profile.dailyCarbsGoal || 200)
      setValue('dailyFatGoal', profile.dailyFatGoal || 70)
    }
  }, [profile, setValue])

  // Load weight detail from latest logged metric
  useEffect(() => {
    if (metricsPage?.content && metricsPage.content.length > 0) {
      const entry = metricsPage.content[0]
      setValue('weightKg', entry.weightKg || entry.weight || 70)
    }
  }, [metricsPage, setValue])

  const updateProfileMutation = useUpdateProfileMutation(() => {
    toast.success('Fitness profile and targets updated!')
  })

  const logMetricMutation = useLogMetricMutation()

  const onSubmit = (data: ProfileFormValues) => {
    // Update main profile DTO
    updateProfileMutation.mutate(data)

    // Save weight metric if it was changed
    const latestWeight = metricsPage?.content?.[0]?.weightKg || metricsPage?.content?.[0]?.weight || 0
    if (data.weightKg && data.weightKg !== latestWeight) {
      logMetricMutation.mutate({
        weightKg: data.weightKg,
      })
    }
  }

  const isLoading = isProfileLoading || isMetricsLoading

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400 text-sm animate-pulse">
        Loading profile configuration...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
        <p className="text-slate-650 dark:text-slate-400 mt-1">Configure your personal physical stats and macronutrient goals.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Physical Stats Card */}
        <Card className="glass-panel border-cyan-500/10">
          <CardHeader className="border-b border-black/5 dark:border-white/5 pb-3">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
              <User className="h-5 w-5" />
              <CardTitle className="text-lg font-bold">Physical Metrics</CardTitle>
            </div>
            <CardDescription>Update your anatomical details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 180"
                  {...register('heightCm', { valueAsNumber: true })}
                />
                {errors.heightCm && (
                  <p className="text-xs text-rose-500">{errors.heightCm.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 70"
                  {...register('weightKg', { valueAsNumber: true })}
                />
                {errors.weightKg && (
                  <p className="text-xs text-rose-500">{errors.weightKg.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
              />
              {errors.birthDate && (
                <p className="text-xs text-rose-500">{errors.birthDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="biologicalSex">Biological Sex</Label>
              <select
                id="biologicalSex"
                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-ring border-black/10 dark:border-white/10 cursor-pointer"
                {...register('biologicalSex')}
              >
                <option value="MALE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Male</option>
                <option value="FEMALE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Female</option>
                <option value="OTHER" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Intensity</Label>
              <select
                id="activityLevel"
                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-ring border-black/10 dark:border-white/10 cursor-pointer"
                {...register('activityLevel')}
              >
                <option value="SEDENTARY" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Sedentary (Little or no exercise)</option>
                <option value="LIGHTLY_ACTIVE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Lightly Active (1-3 days/wk)</option>
                <option value="MODERATE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Moderately Active (3-5 days/wk)</option>
                <option value="VERY_ACTIVE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Very Active (6-7 days/wk)</option>
                <option value="EXTREMELY_ACTIVE" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Super Active (Physical job & double training)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Nutritional Target Goals Card */}
        <div className="flex flex-col space-y-8">
          <Card className="glass-panel border-emerald-500/10">
            <CardHeader className="border-b border-black/5 dark:border-white/5 pb-3">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Goal className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Daily Goals</CardTitle>
              </div>
              <CardDescription>Your target energy & macronutrient breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="dailyCalorieGoal">Calorie Goal (kcal)</Label>
                <Input
                  id="dailyCalorieGoal"
                  type="number"
                  placeholder="e.g. 2500"
                  {...register('dailyCalorieGoal', { valueAsNumber: true })}
                />
                {errors.dailyCalorieGoal && (
                  <p className="text-xs text-rose-500">{errors.dailyCalorieGoal.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyProteinGoal">Protein (g)</Label>
                  <Input
                    id="dailyProteinGoal"
                    type="number"
                    placeholder="150"
                    {...register('dailyProteinGoal', { valueAsNumber: true })}
                  />
                  {errors.dailyProteinGoal && (
                    <p className="text-xs text-rose-500">{errors.dailyProteinGoal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyCarbsGoal">Carbs (g)</Label>
                  <Input
                    id="dailyCarbsGoal"
                    type="number"
                    placeholder="200"
                    {...register('dailyCarbsGoal', { valueAsNumber: true })}
                  />
                  {errors.dailyCarbsGoal && (
                    <p className="text-xs text-rose-500">{errors.dailyCarbsGoal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyFatGoal">Fat (g)</Label>
                  <Input
                    id="dailyFatGoal"
                    type="number"
                    placeholder="70"
                    {...register('dailyFatGoal', { valueAsNumber: true })}
                  />
                  {errors.dailyFatGoal && (
                    <p className="text-xs text-rose-500">{errors.dailyFatGoal.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold tracking-wider uppercase py-6 text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? 'Saving Target Details...' : 'Update Targets'}
          </Button>
        </div>

      </form>
    </div>
  )
}
