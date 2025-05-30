import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { useError } from '@/hooks/use-error'

export function useFormReset<T extends FieldValues>() {
  const { clearErrors } = useError()
  return (form: UseFormReturn<T>, onErrorClear?: () => void) => {
    if (onErrorClear) {
      onErrorClear()
    } else {
      clearErrors()
    }
    form.reset()
  }
}
