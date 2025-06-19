import React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import logo from '@/assets/ATH.png'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({
        to: '/login',

        replace: true,
      })
    } else if (isAuthenticated && !isLoading) {
      navigate({
        to: '/dashboard',
        replace: true,
      })
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className="text-center h-full flex flex-col items-center justify-center gap-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Atarah solutions logo"
          src={logo}
          className="mx-auto h-16 w-auto"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Please wait while we redirect you...
      </p>
    </div>
  )
}
