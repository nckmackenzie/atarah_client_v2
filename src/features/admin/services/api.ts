import type {
  ClientFormValues,
  RoleFormValues,
} from '@/features/admin/utils/admin.types'
import axios from '@/lib/api/axios'

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
