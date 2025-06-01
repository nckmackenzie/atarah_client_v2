import { clsx } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import type { Option, TRoutes } from '@/types/index.types'
import type { ClassValue } from 'clsx'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { router } from '@/main'

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

export function searchParamsToObject(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  return searchParams
}

export function successHandler(
  isEdit: boolean,
  invalidateKey: Array<string>,
  redirectTo: TRoutes,
  resource: string,
) {
  const { queryClient } = getContext()
  toast.success(`${isEdit ? 'Updated' : 'Created'} ${resource} successfully!`)
  queryClient.invalidateQueries({
    queryKey: invalidateKey,
  })
  router.navigate({ to: redirectTo })
}
