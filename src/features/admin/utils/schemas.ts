import { z } from 'zod'
// import { passwordValidator } from '@/features/auth/lib/utils';
import { isValidPhoneNumber } from '@/lib/utils'
import {
  optionalNumberSchemaEntry,
  optionalStringSchemaEntry,
  requiredNumberSchemaEntry,
  requiredStringSchemaEntry,
} from '@/lib/schema-rules'

export const usersFormSchema = z
  .object({
    name: requiredStringSchemaEntry('Name is required'),
    contact: requiredStringSchemaEntry('Contact is required').refine(
      isValidPhoneNumber,
      { message: 'Invalid phone number' },
    ),
    email: optionalStringSchemaEntry(),
    userType: z.enum(['admin', 'user'], { required_error: 'Select user type' }),
    roleId: optionalStringSchemaEntry(),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.userType !== 'admin' && !data.roleId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Role is required for user type',
        path: ['roleId'],
      })
    }
  })

export const roleFormSchema = z.object({
  name: requiredStringSchemaEntry('Role name is required'),
  rights: z.array(z.coerce.number(), {
    required_error: 'Select at least one form',
  }),
  isActive: z.boolean(),
})

export const customerFormSchema = z
  .object({
    name: requiredStringSchemaEntry('Name is required').toLowerCase(),
    email: requiredStringSchemaEntry('Email is required')
      .email('Invalid email address')
      .toLowerCase(),
    contact: requiredStringSchemaEntry('Contact is required'),
    address: optionalStringSchemaEntry(),
    taxPin: optionalStringSchemaEntry(),
    openingBalance: optionalNumberSchemaEntry(),
    openingBalanceDate: z.coerce.date().optional(),
    active: z.boolean(),
  })
  .superRefine(({ openingBalance, openingBalanceDate }, ctx) => {
    if (openingBalance && openingBalance > 0 && !openingBalanceDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Opening balance date is required',
        path: ['openingBalanceDate'],
      })
    }
  })

export const serviceFormSchema = z.object({
  name: requiredStringSchemaEntry('Service name is required').toLowerCase(),
  glAccountId: requiredStringSchemaEntry('G/L account is required'),
  rate: requiredNumberSchemaEntry('Service rate is required'),
  description: optionalStringSchemaEntry(),
  active: z.boolean(),
})

export const projectFormSchema = z.object({
  name: requiredStringSchemaEntry('Project name is required').toLowerCase(),
  description: optionalStringSchemaEntry(),
  active: z.boolean(),
})
