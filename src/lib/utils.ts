import { queryOptions } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import type { Option, TRoutes } from '@/types/index.types'
import type { ClassValue } from 'clsx'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { router } from '@/main'
import { mutationErrorHandler } from '@/lib/error-handlers'
import axios from '@/lib/api/axios'

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
  {
    value: 'bank',
    label: 'Bank',
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
  redirectTo?: TRoutes,
  resource?: string,
) {
  const { queryClient } = getContext()
  toast.success(`${isEdit ? 'Updated' : 'Created'} ${resource} successfully!`)
  queryClient.invalidateQueries({
    queryKey: invalidateKey,
  })
  if (!redirectTo) return
  router.navigate({ to: redirectTo })
}

export function createListQuery<T>(
  resource: string | Array<string>,
  endpoint: string,
) {
  return (q?: string) =>
    queryOptions({
      queryKey: Array.isArray(resource) ? resource : [resource, { q }],
      queryFn: async (): Promise<{ data: Array<T> }> => {
        const params = searchParamsToObject({ q })
        try {
          const { data } = await axios(`${endpoint}?${params.toString()}`)
          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    })
}

export function createListQueryWithObjectParams<T>(
  resource: string | Array<string>,
  endpoint: string,
) {
  return (q?: Record<string, string | number | boolean | undefined | null>) =>
    queryOptions({
      queryKey: Array.isArray(resource) ? resource : [resource, { ...q }],
      queryFn: async (): Promise<{ data: Array<T> }> => {
        const params = searchParamsToObject({ ...q })
        try {
          const { data } = await axios(`${endpoint}?${params.toString()}`)
          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    })
}

export function createDetailQuery<T>(
  resource: string | Array<string>,
  endpoint: string,
) {
  return (id: string) =>
    queryOptions({
      queryKey: Array.isArray(resource) ? [...resource, id] : [resource, id],
      queryFn: async (): Promise<{ data: T }> => {
        try {
          const { data } = await axios(`${endpoint}/${id}`)
          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    })
}

export async function createResource<T>(resource: string, values: T) {
  return await axios.post(`/api/${resource}`, values)
}

export async function updateResource<T>(
  resource: string,
  id: string,
  values: T,
) {
  return await axios.put(`/api/${resource}/${id}`, values)
}

export async function deleteResource(resource: string, id: string) {
  return await axios.delete(`/api/${resource}/${id}`)
}
