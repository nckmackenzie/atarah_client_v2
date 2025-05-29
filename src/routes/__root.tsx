import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import type { QueryClient } from '@tanstack/react-query'

import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx'
import { userQueryOptions } from '@/features/auth/utils/query-options'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(userQueryOptions())
    return { user: data }
  },
  component: () => (
    <>
      <main className="h-dvh">
        <Outlet />
        <Toaster />
      </main>
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </>
  ),
})
