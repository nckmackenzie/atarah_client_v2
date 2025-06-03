import type {
  Client,
  Project,
  Role,
  Service,
  SingleRole,
  User,
} from '@/features/admin/utils/admin.types'

import { createDetailQuery, createListQuery } from '@/lib/utils'

export const userQueryOptions = {
  all: createListQuery<User>('users', '/api/users'),
  user: createDetailQuery<User>('user', '/api/users'),
}

export const roleQueryOptions = {
  all: createListQuery<Role>('roles', '/api/roles'),
  role: createDetailQuery<SingleRole>('role', '/api/roles'),
}

export const clientQueryOptions = {
  all: createListQuery<Client>('clients', '/api/clients'),
  client: createDetailQuery<Client>('client', '/api/clients'),
}

export const serviceQueryOptions = {
  all: createListQuery<Service>('services', '/api/services'),
  service: createDetailQuery<Service>('service', '/api/services'),
}

export const projectQueryOptions = {
  all: createListQuery<Project>('projects', '/api/projects'),
  project: createDetailQuery<Project>('projects', '/api/projects'),
}
