import { queryOptions } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type {
  ClientStatement,
  CollectedPayment,
  ExpenseReport,
  IncomeStatement,
  IncomeStatementExpenseDetail,
  IncomeStatementIncomeDetail,
  InvoiceStatus,
  ReportWithClientAndDateRange,
} from '@/features/reports/utils/report.types'
import axios from '@/lib/api/axios'
import { searchParamsToObject } from '@/lib/utils'

export const reportQueryOptions = {
  invoiceStatus: ({ clientId, from, to }: ReportWithClientAndDateRange) => {
    const params = searchParamsToObject({ clientId, from, to })
    return queryOptions({
      queryKey: ['invoice report by status', clientId, from, to],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: Array<InvoiceStatus>
          totals: {
            totalAmount: string
            totalPaid: string
            totalBalance: string
          }
        }> = await axios.get(
          `/api/reports/invoices/status?${params.toString()}`,
          {
            signal,
          },
        )

        return data
      },
    })
  },
  outstandingInvoices: (clientId?: string) => {
    const params = searchParamsToObject({ clientId })
    return queryOptions({
      queryKey: ['outstanding invoices', clientId],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: Array<Omit<InvoiceStatus, 'status'>>
          totals: {
            totalAmount: string
            totalPaid: string
            totalBalance: string
          }
        }> = await axios.get(
          `/api/reports/invoices/outstanding?${params.toString()}`,
          {
            signal,
          },
        )
        return data
      },
    })
  },
  collectedPayments: ({ clientId, from, to }: ReportWithClientAndDateRange) => {
    const params = searchParamsToObject({ clientId, from, to })
    return queryOptions({
      queryKey: ['collected payments', clientId, from, to],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: Array<CollectedPayment>
          total: string
        }> = await axios.get(
          `/api/reports/payments/collected?${params.toString()}`,
          {
            signal,
          },
        )

        return data
      },
    })
  },
  clientStatement: ({ clientId, from, to }: ReportWithClientAndDateRange) => {
    const params = searchParamsToObject({ clientId, from, to })
    return queryOptions({
      queryKey: ['client statement', clientId, from, to],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: Array<ClientStatement>
          total: string
        }> = await axios.get(
          `/api/reports/client-statement?${params.toString()}`,
          {
            signal,
          },
        )

        return data
      },
    })
  },
  expenseReport: ({
    from,
    to,
    glAccountId,
    projectId,
  }: {
    from?: string
    to?: string
    glAccountId?: string
    projectId?: string
  }) => {
    const params = searchParamsToObject({ from, to, glAccountId, projectId })
    return queryOptions({
      queryKey: ['expense report', from, to, glAccountId, projectId],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: Array<ExpenseReport>
          total: string
        }> = await axios.get(`/api/reports/expenses?${params.toString()}`, {
          signal,
        })

        return data
      },
    })
  },
  incomeStatement: ({ from, to }: { from?: string; to?: string }) => {
    const params = searchParamsToObject({ from, to })
    return queryOptions({
      queryKey: ['income statement', from, to],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: IncomeStatement
          totals: { totalIncome: string; totalExpense: string }
        }> = await axios.get(
          `/api/reports/income-statement?${params.toString()}`,
          {
            signal,
          },
        )

        return data
      },
    })
  },
  incomeStatementIncomeDetail: ({
    serviceId,
    from,
    to,
  }: {
    serviceId: string
    from?: string
    to?: string
  }) => {
    const params = searchParamsToObject({ serviceId, from, to })
    return queryOptions({
      queryKey: ['income statement income detail', serviceId, from, to],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: Array<IncomeStatementIncomeDetail>
          totals: string
        }> = await axios.get(
          `/api/reports/income-statement/income-detailed?${params.toString()}`,
          {
            signal,
          },
        )

        return data
      },
    })
  },
  incomeStatementExpenseDetail: ({
    parentAccount,
    from,
    to,
  }: {
    parentAccount: string
    from?: string
    to?: string
  }) => {
    const params = searchParamsToObject({ parentAccount, from, to })
    return queryOptions({
      queryKey: ['income statement expense detail', parentAccount, from, to],
      queryFn: async ({ signal }) => {
        const {
          data,
        }: AxiosResponse<{
          data: Array<IncomeStatementExpenseDetail>
          totals: string
        }> = await axios.get(
          `/api/reports/income-statement/expense-detailed?${params.toString()}`,
          {
            signal,
          },
        )

        return data
      },
    })
  },
}
