import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import logo from '@/assets/atarah_logo.png'

import { LoginForm } from '@/features/auth/components/login-form'
import { useDocumentTitle } from '@/hooks/use-title'
import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Login')
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({
        to: '/dashboard',
        replace: true,
      })
    }
  }, [isAuthenticated, isLoading, navigate])
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Atarah solutions logo"
          src={logo}
          className="mx-auto h-32 w-auto"
        />
        <h2 className="-mt-6 text-center text-2xl/9 font-bold tracking-tight">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
