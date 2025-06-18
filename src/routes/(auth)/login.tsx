import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { LoginForm } from '@/features/auth/components/login-form'
import { useDocumentTitle } from '@/hooks/use-title'
import { useAuth } from '@/hooks/use-auth'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
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
    <>
      <div className="space-y-0.5  mt-2 mb-6">
        <h2 className="text-center text-2xl/9 font-bold tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Enter your credentials to access your account.
        </p>
      </div>
      <LoginForm />
    </>
  )
}
