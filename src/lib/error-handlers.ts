import { isAxiosError } from 'axios'
import type { UseFormSetError } from 'react-hook-form'
import { router } from '@/main'

interface ApiErrors {
  [key: string]: string
}

export const handleApiErrors = <T extends Record<string, any>>(
  errors: ApiErrors,
  setError: UseFormSetError<T>,
) => {
  Object.keys(errors).forEach((field) => {
    setError(field as any, {
      type: 'manual',
      message: errors[field],
    })
  })
}

export function mutationErrorHandler(error: unknown) {
  let errors = ''
  if (isAxiosError(error)) {
    switch (error.status) {
      case 422:
        errors = 'Validation failed. Please check your inputs.'
        break
      case 404:
        errors = 'Could not find the requested resource.'
        break
      case 302:
        errors = error.response?.data.message
        break
      case 401:
        router.navigate({ to: '/login', replace: true })
        break
      default:
        errors = error.response?.data.error || error.response?.data.message
        break
    }
  } else {
    if (error instanceof Error) {
      errors = error.message
    } else {
      errors = 'An unexpected error occurred.'
    }
  }
  return errors
}
