import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SheetProvider } from '@/components/providers/sheet-provider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 30 } },
})

export function getContext() {
  return {
    queryClient,
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SheetProvider>{children}</SheetProvider>
    </QueryClientProvider>
  )
}
