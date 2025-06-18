import { queryOptions } from '@tanstack/react-query'
import type { Invoice } from '@/features/transactions/utils/transactions.types'
import type {
  DashboardStats,
  TopClient,
} from '@/features/dashboard/utils/dashboard.types'
import axios from '@/lib/api/axios'

export const dashboardQueryOptions = {
  stats: () =>
    queryOptions({
      queryKey: ['dashboard', 'stats'],
      queryFn: async ({ signal }): Promise<{ data: DashboardStats }> => {
        const { data } = await axios.get(`/api/dashboard/stats`, {
          signal,
        })

        return data
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    }),
  pendingInvoices: () =>
    queryOptions({
      queryKey: ['invoices'],
      queryFn: async ({ signal }): Promise<{ data: Array<Invoice> }> => {
        // throw new Error('Pending invoices query not implemented')
        const { data } = await axios.get(`/api/invoices?status=pending`, {
          signal,
        })
        return data
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    }),
  topClients: () =>
    queryOptions({
      queryKey: ['dashboard', 'top-clients'],
      queryFn: async ({ signal }): Promise<{ data: Array<TopClient> }> => {
        const { data } = await axios.get(`/api/dashboard/top-clients`, {
          signal,
        })
        return data
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    }),
  revenueVsExpenses: () =>
    queryOptions({
      queryKey: ['dashboard', 'revenue-vs-expenses'],
      queryFn: async ({
        signal,
      }): Promise<{
        data: Array<{ month: string; revenue: number; expenses: number }>
      }> => {
        const { data } = await axios.get(`/api/dashboard/revenue-expense`, {
          signal,
        })
        return data
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    }),
}
