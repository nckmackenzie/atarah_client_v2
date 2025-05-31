import { z } from 'zod'
// import { passwordValidator } from '@/features/auth/lib/utils';
import { isValidPhoneNumber } from '@/lib/utils'
import {
  optionalStringSchemaEntry,
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
