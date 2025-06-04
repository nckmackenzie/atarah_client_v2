import { z } from 'zod'
import {
  optionalStringSchemaEntry,
  requiredStringSchemaEntry,
} from '@/lib/schema-rules'

export const accountsFormSchema = z
  .object({
    name: requiredStringSchemaEntry('Account Name is required'),
    accountTypeId: requiredStringSchemaEntry('Account Type is required'),
    isSubcategory: z.boolean(),
    parentId: optionalStringSchemaEntry(),
    description: optionalStringSchemaEntry(),
    active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isSubcategory && !data.parentId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Parent Account is required for sub category',
        path: ['parentId'],
      })
    }
  })
