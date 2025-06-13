import { queryOptions } from '@tanstack/react-query'
import type {
  Account,
  AccountMin,
  AccountValue,
  Expense,
  ExpenseWithAttachments,
  Invoice,
  InvoicePayment,
  InvoiceWithDetails,
  JournalEntry,
} from '@/features/transactions/utils/transactions.types'
import axios from '@/lib/api/axios'
import { mutationErrorHandler } from '@/lib/error-handlers'
import {
  createDetailQuery,
  createListQuery,
  createListQueryWithObjectParams,
} from '@/lib/utils'

export const accountsQueryOptions = {
  all: createListQuery<Account>('accounts', '/api/accounts'),
  min: createListQuery<AccountMin>(['accounts', 'min'], '/api/accounts/min'),

  account: createDetailQuery<AccountValue>('account', '/api/accounts'),
}

export const invoiceQueryOptions = {
  all: createListQueryWithObjectParams<Invoice>('invoices', '/api/invoices'),
  invoice: createDetailQuery<InvoiceWithDetails>('invoices', '/api/invoices'),
}

export const invoicePaymentQueryOptions = {
  all: createListQuery<InvoicePayment>(
    ['invoices', 'payments'],
    '/api/invoices/payments',
  ),
  invoicePayment: createDetailQuery<InvoiceWithDetails>(
    ['invoices', 'payments'],
    '/api/invoices/payments',
  ),
}

export const pendingInvoiceByClientQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ['invoices', 'pending', clientId],
    queryFn: async (): Promise<{
      data: Array<{
        id: string
        invoiceNo: string
        invoiceDate: string
        totalAmount: string
        balance: string
      }>
    }> => {
      try {
        const { data } = await axios(`/api/invoices/${clientId}/pending`)
        return data
      } catch (err) {
        const error = mutationErrorHandler(err)
        throw new Error(error)
      }
    },
  })

export const expenseQueryOptions = {
  all: createListQuery<Expense>('expenses', '/api/expenses'),
  expenseNo: () =>
    queryOptions({
      queryKey: ['expenses', 'expense no'],
      queryFn: async (): Promise<{ data: number }> => {
        try {
          const { data } = await axios('/api/expenses/expense-no')
          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),
  expense: createDetailQuery<ExpenseWithAttachments>(
    'expenses',
    '/api/expenses',
  ),
}

export const journalQueryOptions = {
  journalNo: () =>
    queryOptions({
      queryKey: ['journal entries', 'journal no'],
      queryFn: async (): Promise<{ data: number }> => {
        try {
          const { data } = await axios('/api/journal-entries/journal-no')
          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),
  journal: createDetailQuery<JournalEntry>(
    'journal entries',
    '/api/journal-entries',
  ),
}
