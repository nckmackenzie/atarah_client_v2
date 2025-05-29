import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Option } from '@/types/index.types'
import type { ClassValue } from 'clsx'

export const PAYMENT_METHOD: Array<Option> = [
  {
    value: 'cash',
    label: 'Cash',
  },
  {
    value: 'mpesa',
    label: 'Mpesa',
  },
  {
    value: 'cheque',
    label: 'Cheque',
  },
]

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function isValidPhoneNumber(input: string) {
  return /^\d{10}$/.test(input)
}

export function indexPageApiRoute(resource: string, query?: string) {
  return `/api/${resource}${query ? `?${query}` : ''}`
}

export function generateUniqueString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
