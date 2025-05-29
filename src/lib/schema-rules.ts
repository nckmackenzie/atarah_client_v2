import { z } from 'zod'

export const paymentMethodSchemaEntry = () =>
  z.enum(['cash', 'mpesa', 'bank']).default('mpesa')

export const paymentReferenceSchemaEntry = () =>
  z.string().trim().min(1, { message: 'Reference is required' }).toLowerCase()

export const requiredStringSchemaEntry = (message?: string) =>
  z
    .string()
    .trim()
    .min(1, { message: message || 'This field is required' })

export const optionalStringSchemaEntry = () => z.string().optional()
export const optionalNumberSchemaEntry = () => z.coerce.number().optional()
export const requiredDateSchemaEntry = () =>
  z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date must be a valid date',
  })

export const requiredNumberSchemaEntry = (message?: string) =>
  z.coerce
    .number({
      required_error: message || 'Field is required',
      invalid_type_error: 'Field must be a number',
    })
    .min(1, { message: message || 'Field is required' })
    .refine((value) => !isNaN(value) && value > 0, {
      message: 'This field must be a valid number greater than 0',
    })
