import type { z } from 'zod'
import type { WithCreatedAt, WithId, WithIdAndName } from '@/types/index.types'
import type {
  accountsFormSchema,
  invoiceFormSchema,
  invoicePaymentFormSchema,
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
    parentId: string | null
    accountTypeId: string | null
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
