import { queryOptions } from '@tanstack/react-query'
import type {
  Client,
  Project,
  Role,
  Service,
  SingleRole,
  User,
} from '@/features/admin/utils/admin.types'

import { mutationErrorHandler } from '@/lib/error-handlers'
import axios from '@/lib/api/axios'
import {
  createDetailQuery,
  createListQuery,
  searchParamsToObject,
} from '@/lib/utils'

export const userQueryOptions = {
  all: (q?: string) =>
    queryOptions({
      queryKey: ['users', { q }],
      queryFn: async (): Promise<{ data: Array<User> }> => {
        const params = new URLSearchParams()
        if (q && q.trim().length > 0) {
          params.append('q', q)
        }
        try {
          const { data } = await axios('/api/users?' + params.toString())

          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),

  user: (id: string) =>
    queryOptions({
      queryKey: ['users', id],
      queryFn: async (): Promise<{ data: User }> => {
        try {
          const { data } = await axios('/api/users/' + id)

          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),
}

export const roleQueryOptions = {
  all: (q?: string) =>
    queryOptions({
      queryKey: ['roles', { q }],
      queryFn: async (): Promise<{ data: Array<Role> }> => {
        const params = searchParamsToObject({ q })
        try {
          const { data } = await axios('/api/roles?' + params.toString())

          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),

  role: (id: string) =>
    queryOptions({
      queryKey: ['role', id],
      queryFn: async (): Promise<{ data: SingleRole }> => {
        try {
          const { data } = await axios('/api/roles/' + id)

          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),
}

export const clientQueryOptions = {
  all: (q?: string) =>
    queryOptions({
      queryKey: ['clients', { q }],
      queryFn: async (): Promise<{ data: Array<Client> }> => {
        const params = searchParamsToObject({ q })
        try {
          const { data } = await axios('/api/clients?' + params.toString())

          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),

  client: (id: string) =>
    queryOptions({
      queryKey: ['client', id],
      queryFn: async (): Promise<{ data: Client }> => {
        try {
          const { data } = await axios('/api/clients/' + id)

          return data
        } catch (err) {
          const error = mutationErrorHandler(err)
          throw new Error(error)
        }
      },
    }),
}

export const serviceQueryOptions = {
  all: createListQuery<Service>('services', '/api/services'),
  service: createDetailQuery<Service>('service', '/api/services'),
}

export const projectQueryOptions = {
  all: createListQuery<Project>('projects', '/api/projects'),
  service: createDetailQuery<Project>('projects', '/api/projects'),
}
