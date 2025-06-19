import type { ChangePasswordFormValues } from '@/features/profile/components/change-password-form'
import axios from '@/lib/api/axios'

export async function updatePassword(data: ChangePasswordFormValues) {
  await axios.put('/api/password/update', data)
}

export async function forgotPassword(data: { email: string }) {
  await axios.post('/api/forgot-password', data)
}
