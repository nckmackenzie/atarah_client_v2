import type { WithId } from '@/types/index.types'

export interface ReportDateRange {
  from: string
  to: string
}

export interface ReportWithClientAndDateRange extends ReportDateRange {
  clientId: string
}

export type InvoiceStatus = {
  invoiceNo: string
  clientName: string
  invoiceDate: string
  dueDate: string
  totalAmount: string
  totalPaid: string
  balance: string
  status: 'Paid' | 'Overdue' | 'Pending'
}

export type CollectedPayment = WithId &
  Pick<InvoiceStatus, 'clientName' | 'invoiceNo'> & {
    paymentDate: string
    amount: string
    paymentMethod: string
    paymentReference: string
  }

export type ClientStatement = {
  date: string
  reference: string
  debit: string
  credit: string
  balance: string
}

export type ExpenseReport = {
  expenseNo: number
  expenseDate: string
  payee: string
  accountName: string
  projectName: string
  paymentMethod: string
  paymentReference: string
  amount: string
}

export type IncomeStatementIncome = {
  serviceId: string
  serviceName: string
  total: string
}

export type IncomeStatementExpense = {
  accountName: string
  total: string
}

export type IncomeStatement = {
  incomes: Array<IncomeStatementIncome>
  expenses: Array<IncomeStatementExpense>
}

export type IncomeStatementIncomeDetail = Pick<
  InvoiceStatus,
  'clientName' | 'invoiceDate' | 'invoiceNo'
> & {
  rate: string
  quantity: string
  discount: string
  total: string
}

export type IncomeStatementExpenseDetail = {
  transactionDate: string
  account: string
  description: string | null
  reference: string | null
  amount: string
}
