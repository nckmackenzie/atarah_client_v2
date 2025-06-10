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
