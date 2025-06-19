import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requiredStringSchemaEntry } from '@/lib/schema-rules'
import { useDocumentTitle } from '@/hooks/use-title'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/custom/password-input'
import { Button } from '@/components/ui/button'
import { useError } from '@/hooks/use-error'
import { formErrorHandler } from '@/lib/error-handlers'
import axios from '@/lib/api/axios'
import { CustomAlert } from '@/components/custom/custom-alert'

const changePasswordFormSchema = z
  .object({
    password: requiredStringSchemaEntry('Enter your new password').min(
      8,
      'New password must be at least 8 characters long',
    ),
    passwordConfirmation: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'New passwords do not match',
    path: ['passwordConfirmation'],
  })

export const Route = createFileRoute('/(auth)/reset-password')({
  validateSearch: z.object({
    resetToken: z.string().min(1, 'Reset token is required'),
  }),
  component: ResetPasswordRouteComponent,
})

function ResetPasswordRouteComponent() {
  useDocumentTitle('Reset Password')
  const { resetToken } = Route.useSearch()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof changePasswordFormSchema>>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  })

  const { clearErrors, errors, onError } = useError()
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: z.infer<typeof changePasswordFormSchema>) => {
      await axios.post(
        `/api/forgot-password/${resetToken}/reset-password`,
        data,
      )
    },
  })

  function onSubmit(data: z.infer<typeof changePasswordFormSchema>) {
    clearErrors()
    mutate(data, {
      onError: (err) => formErrorHandler(err, form.setError, onError),
      onSuccess: () => {
        toast.success('Password updated successfully')
        form.reset()
        navigate({ to: '/login', replace: true })
      },
    })
  }

  return (
    <div className="space-y-6">
      {errors && <CustomAlert variant="error" description={errors} />}
      <div className="space-y-0.5  mt-2 mb-6">
        <h2 className="text-center text-2xl/9 font-bold tracking-tight">
          Reset your password
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-prose">
          Create your new password and confirm it.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="********"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="********"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            Update Password
          </Button>
        </form>
      </Form>
    </div>
  )
}
