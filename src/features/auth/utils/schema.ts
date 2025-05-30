import { z } from 'zod'
import { requiredStringSchemaEntry } from '@/lib/schema-rules'

export const loginSchema = z.object({
  email: requiredStringSchemaEntry('Email address is required').email(
    'Invalid email address',
  ),
  password: requiredStringSchemaEntry('Password is required').min(
    6,
    'Password must be at least 8 characters long',
  ),
})
