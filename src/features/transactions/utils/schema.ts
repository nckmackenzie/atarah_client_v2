import { z } from 'zod'
import {
  optionalNumberSchemaEntry,
  optionalStringSchemaEntry,
  paymentMethodSchemaEntry,
  paymentReferenceSchemaEntry,
  requiredDateSchemaEntry,
  requiredNumberSchemaEntry,
  requiredStringSchemaEntry,
} from '@/lib/schema-rules'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/utils'

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

export const invoiceFormSchema = z
  .object({
    invoiceNo: requiredStringSchemaEntry('Invoice number is required'),
    invoiceDate: requiredDateSchemaEntry(),
    dueDate: requiredDateSchemaEntry(),
    clientId: requiredStringSchemaEntry('Client is required'),
    terms: requiredStringSchemaEntry('Terms is required'),
    vatType: z.enum(['no_vat', 'inclusive', 'exclusive'], {
      required_error: 'Vat type is required',
    }),
    vat: z.coerce.number().optional(),
    items: z.array(
      z.object({
        id: z.string(),
        serviceId: requiredStringSchemaEntry('Service is required'),
        quantity: requiredNumberSchemaEntry('Quantity is required'),
        rate: requiredNumberSchemaEntry('Rate is required'),
        discount: optionalNumberSchemaEntry(),
      }),
    ),
  })
  .superRefine(({ vatType, vat, dueDate, invoiceDate }, ctx) => {
    if (vatType !== 'no_vat' && !vat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vat is required',
        path: ['vat'],
      })
    }
    if (dueDate < invoiceDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Due date must be greater than invoice date',
        path: ['dueDate'],
      })
    }
  })

export const invoicePaymentFormSchema = z
  .object({
    invoiceId: requiredStringSchemaEntry('Invoice is required'),
    paymentDate: requiredDateSchemaEntry(),
    amount: requiredNumberSchemaEntry('Amount is required'),
    paymentMethod: paymentMethodSchemaEntry(),
    paymentReference: paymentReferenceSchemaEntry(),
  })
  .superRefine(({ paymentDate, invoiceId }, ctx) => {
    if (!invoiceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invoice ID is required',
        path: ['invoiceId'],
      })
    }
    if (paymentDate > new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Payment date cannot be in the future',
        path: ['paymentDate'],
      })
    }
  })

export const invoiceBulkPaymentFormSchema = z.object({
  clientId: requiredStringSchemaEntry('Client is required'),
  paymentDate: requiredDateSchemaEntry(),
  paymentMethod: paymentMethodSchemaEntry(),
  paymentReference: paymentReferenceSchemaEntry(),
  invoices: z.array(
    z.object({
      invoiceId: requiredStringSchemaEntry(),
      invoiceDate: requiredStringSchemaEntry(),
      invoiceNo: requiredStringSchemaEntry(),
      invoiceAmount: requiredStringSchemaEntry(),
      amount: z.coerce.number(),
    }),
  ),
})

export const expenseFormSchema = z.object({
  expenseDate: requiredDateSchemaEntry(),
  payee: requiredStringSchemaEntry('Payee is required').toLowerCase(),
  paymentMethod: paymentMethodSchemaEntry(),
  paymentReference: requiredStringSchemaEntry('Payment reference is required'),
  details: z.array(
    z.object({
      id: z.string(),
      glAccountId: requiredStringSchemaEntry('Account is required'),
      projectId: optionalStringSchemaEntry(),
      amount: requiredNumberSchemaEntry('Enter valid amount'),
      description: optionalStringSchemaEntry(),
    }),
  ),
  attachments: z
    .array(
      z
        .any()
        .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
          (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
          'Only .jpg, .jpeg, .png, .webp and .pdf formats are supported.',
        ),
    )
    .optional(),
})
// .superRefine(({ paymentReference, paymentMethod }, ctx) => {
//   if (paymentMethod === 'mpesa' && !paymentReference) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Enter Mpesa reference',
//       path: ['paymentReference'],
//     });
//   }
//   if (paymentMethod === 'cheque' && !paymentReference) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Enter cheque no...',
//       path: ['paymentReference'],
//     });
//   }
//   if (paymentMethod === 'bank' && !paymentReference) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Enter payment details',
//       path: ['paymentReference'],
//     });
//   }
// });

export const journalFormSchema = z.object({
  transactionDate: requiredDateSchemaEntry(),
  details: z.array(
    z
      .object({
        id: requiredStringSchemaEntry(),
        glAccountId: requiredStringSchemaEntry('Account is required'),
        debit: optionalNumberSchemaEntry(),
        credit: optionalNumberSchemaEntry(),
        description: optionalStringSchemaEntry(),
      })
      .refine(
        (data) => {
          const { debit, credit } = data
          const isDebit = debit && debit > 0
          const isCredit = credit && credit > 0
          const isValid = isDebit || isCredit
          return isValid
        },
        { message: 'Either debit or credit must be provided' },
      ),
  ),
})
