import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import axios from '@/lib/api/axios'
import { userQueryOptions } from '@/features/auth/utils/query-options'

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const userQuery = useQuery({ ...userQueryOptions() })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/logout')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      queryClient.removeQueries()
      router.invalidate()
      router.navigate({ to: '/login', replace: true })
    },
  })

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    logout: logoutMutation.mutate,
    isLogginOut: logoutMutation.isPending,
  }
}
