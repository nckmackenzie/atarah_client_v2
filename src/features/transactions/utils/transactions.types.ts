import type { z } from 'zod'
import type { WithCreatedAt, WithId, WithIdAndName } from '@/types/index.types'
import type { accountsFormSchema } from '@/features/transactions/utils/schema'

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
