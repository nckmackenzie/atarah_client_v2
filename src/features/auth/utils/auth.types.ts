import type { z } from 'zod'
import type { loginSchema } from '@/features/auth/utils/schema'

export type LoginValues = z.infer<typeof loginSchema>
