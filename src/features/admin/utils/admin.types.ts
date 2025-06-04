import type { z } from 'zod'
import type {
  customerFormSchema,
  projectFormSchema,
  roleFormSchema,
  serviceFormSchema,
  usersFormSchema,
} from '@/features/admin/utils/schemas'
import type {
  WithCreatedAt,
  WithId,
  WithIdAndName,
  WithName,
} from '@/types/index.types'

export type UserFormValues = z.infer<typeof usersFormSchema>
export type User = WithId &
  WithCreatedAt &
  Omit<UserFormValues, 'roleId' | 'password' | 'passwordConfirmation'> & {
    email: string | null
    role: WithIdAndName | null
  }

export type RoleFormValues = z.infer<typeof roleFormSchema>
export type Role = WithId &
  WithCreatedAt &
  RoleFormValues & {
    usersCount: number
  }

export type SingleRole = Omit<Role, 'usersCount' | 'rights'> & {
  rights: Array<{
    form: WithName & { id: number }
  }>
}

export type ClientFormValues = z.infer<typeof customerFormSchema>
export type Client = WithId &
  WithCreatedAt &
  Omit<ClientFormValues, 'openingBalanceDate' | 'openingBalance'> & {
    totalInvoiced: number
  }

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

export type Service = WithId &
  WithCreatedAt &
  Omit<ServiceFormValues, 'glAccountId'> & {
    account: WithIdAndName
  }

export type ProjectFormValues = z.infer<typeof projectFormSchema>
export type Project = WithId & WithCreatedAt & ProjectFormValues
