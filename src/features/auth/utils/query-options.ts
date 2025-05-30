import { isAxiosError } from 'axios'
import { queryOptions } from '@tanstack/react-query'
import type { Form, User } from '@/types/index.types'
import axios from '@/lib/api/axios'
import { mutationErrorHandler } from '@/lib/error-handlers'

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ['auth-user'],
    queryFn: async (): Promise<User | null> => {
      try {
        const { data } = await axios('/api/user')
        return data
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return null
        }
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const formsQueryOptions = () =>
  queryOptions({
    queryKey: ['forms'],
    queryFn: async (): Promise<{ data: Array<Form> }> => {
      try {
        const { data } = await axios('/api/forms')
        return data
      } catch (err) {
        const error = mutationErrorHandler(err)
        throw error
      }
    },
    staleTime: 1000 * 60 * 60,
  })
