import type { z } from 'zod'
import type {
  roleFormSchema,
  usersFormSchema,
} from '@/features/admin/utils/schemas'
import type { WithCreatedAt, WithId, WithIdAndName } from '@/types/index.types'

// USER TYPES
export type UserFormValues = z.infer<typeof usersFormSchema>
export type User = WithId &
  WithCreatedAt &
  Omit<UserFormValues, 'roleId' | 'password' | 'passwordConfirmation'> & {
    email: string | null
    role: WithIdAndName | null
  }

export type RoleFormValues = z.infer<typeof roleFormSchema>
export type Role = WithId & WithCreatedAt & RoleFormValues
