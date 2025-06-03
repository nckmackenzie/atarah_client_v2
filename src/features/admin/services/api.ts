import type {
  ClientFormValues,
  ProjectFormValues,
  RoleFormValues,
  ServiceFormValues,
} from '@/features/admin/utils/admin.types'
import axios from '@/lib/api/axios'
import { createResource, deleteResource, updateResource } from '@/lib/utils'

export async function createRole(values: RoleFormValues) {
  await axios.post('/api/roles', values)
}

export async function updateRole(id: string, values: RoleFormValues) {
  await axios.put(`/api/roles/${id}`, values)
}

export async function createClient(values: ClientFormValues) {
  await axios.post('/api/clients', values)
}

export async function updateClient(id: string, values: ClientFormValues) {
  await axios.put(`/api/clients/${id}`, values)
}

export async function deleteClient(id: string) {
  await axios.delete(`/api/clients/${id}`)
}
export async function createService(values: ServiceFormValues) {
  await createResource<ServiceFormValues>('services', values)
}

export async function updateService(id: string, values: ServiceFormValues) {
  await updateResource<ServiceFormValues>('services', id, values)
}

export async function deleteService(id: string) {
  await deleteResource(`services`, id)
}

export async function createProject(values: ProjectFormValues) {
  await createResource<ProjectFormValues>('projects', values)
}

export async function updateProject(id: string, values: ProjectFormValues) {
  await updateResource<ProjectFormValues>('projects', id, values)
}

export async function deleteProject(id: string) {
  await deleteResource(`projects`, id)
}
