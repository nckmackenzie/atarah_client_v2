import type { RoleFormValues } from '@/features/admin/utils/admin.types'
import axios from '@/lib/api/axios'

export async function createRole(values: RoleFormValues) {
  await axios.post('/api/roles', values)
}

export async function updateRole(id: string, values: RoleFormValues) {
  await axios.put(`/api/roles/${id}`, values)
}
