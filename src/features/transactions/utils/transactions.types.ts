import type { z } from 'zod'
import type {
  PaymentMethod,
  WithCreatedAt,
  WithId,
  WithIdAndName,
} from '@/types/index.types'
import type {
  accountsFormSchema,
  expenseFormSchema,
  invoiceBulkPaymentFormSchema,
  invoiceFormSchema,
  invoicePaymentFormSchema,
  journalFormSchema,
} from '@/features/transactions/utils/schema'

type AccountType =
  | 'income'
  | 'expense'
  | 'asset'
  | 'liability'
  | 'equity'
  | 'dividend'

export interface Account extends WithIdAndName {
  accountType: AccountType | null
  children: Array<Account>
  isActive: boolean
  isEditable: boolean
}

export type AccountMin = WithIdAndName &
  WithCreatedAt & {
    parentId: string
    accountTypeId: string
    isSubcategory: boolean
    isBank: false
    accountNo: string | null
    active: boolean
    isEditable: boolean
  }
export type AccountFormValues = z.infer<typeof accountsFormSchema>
export type AccountValue = WithId & AccountFormValues

export interface Invoice extends WithId, WithCreatedAt {
  invoiceDate: string
  invoiceNo: string
  terms: '0' | '30' | '60'
  dueDate: string
  vatType: 'exclusive' | 'inclusive' | 'no_vat'
  vat: string
  discount: string
  subTotal: string
  vatAmount: string
  totalAmount: string
  updatedAt: string | null
  amountPaid: string | null
  client: WithIdAndName
}

export interface InvoiceWithDetails extends Invoice {
  details: Array<{
    id: string
    remarks: string | null
    quantity: number
    rate: string
    discount: string
    amount: string
    service: WithIdAndName
  }>
}

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>
export type InvoicePaymentFormValues = z.infer<typeof invoicePaymentFormSchema>
export type InvoicePaymentBulkFormValues = z.infer<
  typeof invoiceBulkPaymentFormSchema
>

export type InvoicePayment = WithId &
  Omit<InvoicePaymentFormValues, 'invoiceId'> & {
    amount: string
    invoiceNo: string
    invoiceDate: string
    totalAmount: string
    clientName: string
  }

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

export type ExpenseDetail = {
  id: number
  amount: string
  description: string | null
  project: WithIdAndName | null
  account: WithIdAndName
}

export type Expense = WithId &
  WithCreatedAt & {
    expenseDate: string
    expenseNo: number
    payee: string
    paymentMethod: PaymentMethod
    paymentReference: string | null
    expenseTotal: string
    details: Array<ExpenseDetail>
  }

export interface ExpenseWithAttachments extends Expense {
  attachments: Array<{ id: number; fileUrl: string }> | null
}

export type JournalFormValues = z.infer<typeof journalFormSchema>

export interface JournalEntry {
  id: number
  journalNo: number
  transactionDate: Date
  transactionId: string
  details: Array<{
    id: number
    account: WithIdAndName
    debit: number
    credit: number
    description: string | null
  }>
}
