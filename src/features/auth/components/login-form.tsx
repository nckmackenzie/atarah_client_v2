import { useForm } from 'react-hook-form'
import { isAxiosError } from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

import type { LoginValues } from '@/features/auth/utils/auth.types'
import { loginSchema } from '@/features/auth/utils/schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/custom/password-input'
import { Button } from '@/components/ui/button'
import { useMutate } from '@/hooks/use-mutate'
import axios from '@/lib/api/axios'
import { handleApiErrors, mutationErrorHandler } from '@/lib/error-handlers'
import { CustomAlert } from '@/components/custom/custom-alert'
import { useError } from '@/hooks/use-error'
import { router } from '@/main'

export function LoginForm() {
  const form = useForm<LoginValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  })
  const { clearErrors, errors, onError } = useError()
  const queryClient = useQueryClient()

  const { isPending, mutate } = useMutate(async (data: LoginValues) => {
    await axios('/sanctum/csrf-cookie')
    await axios.post('/api/login', data)
  })
  return (
    <div className="space-y-4">
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            clearErrors()
            mutate(data, {
              onSuccess: () => {
                form.reset()
                queryClient.invalidateQueries({ queryKey: ['auth-user'] })
                router.invalidate()
                router.navigate({ to: '/dashboard', replace: true })
              },
              onError: (error) => {
                if (isAxiosError(error)) {
                  if (error.response?.status === 422) {
                    handleApiErrors(error.response.data.errors, form.setError)
                  } else {
                    onError(mutationErrorHandler(error))
                  }
                }
              },
            })
          })}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    placeholder="jsmith@example.com"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="*******"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  )
}
