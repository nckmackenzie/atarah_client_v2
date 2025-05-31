import { Fragment } from 'react'
import type { PropsWithChildren } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function AdminGuard({ children }: PropsWithChildren) {
  const { user } = useAuth()
  if (user?.userType !== 'admin') return null
  return <Fragment>{children}</Fragment>
}
