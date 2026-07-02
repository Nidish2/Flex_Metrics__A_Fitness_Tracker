import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../api/authApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { toast } from 'sonner'


import { Logo } from '@/components/ui/Logo'

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const Login: React.FC = () => {
  const navigate = useNavigate()
  
  const loginMutation = useLoginMutation(
    () => {
      toast.success('Welcome back! Login successful.')
      navigate('/dashboard')
    },
    (error) => {
      console.error(error)
      const errorMsg = error.response?.data?.message || 'Invalid email or password. Please try again.'
      toast.error(errorMsg)
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="flex items-center justify-center w-full px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-300">
      <Card className="w-full max-w-md border-slate-200/50 dark:border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Logo size={48} className="text-primary animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Access Your Fitness Dashboard
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Enter your credentials to manage your workouts and meals
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full font-extrabold uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:scale-[1.01] active:scale-[0.99] transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
            <div className="text-sm text-center text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-semibold">
                Register here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
