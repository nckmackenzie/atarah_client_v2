import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { requiredStringSchemaEntry } from '@/lib/schema-rules'
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
import { Separator } from '@/components/ui/separator'
import { useMutate } from '@/hooks/use-mutate'
import { updatePassword } from '@/features/profile/services/api'
import { formErrorHandler } from '@/lib/error-handlers'
import { useError } from '@/hooks/use-error'
import { CustomAlert } from '@/components/custom/custom-alert'

const changePasswordFormSchema = z
  .object({
    currentPassword: requiredStringSchemaEntry('Enter your current password'),
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

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>

export function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    },
  })

  const { isPending, mutate } = useMutate(updatePassword)
  const { clearErrors, errors, onError } = useError()

  function onSubmit(data: ChangePasswordFormValues) {
    clearErrors()
    mutate(data, {
      onError: (err) => formErrorHandler(err, form.setError, onError),
      onSuccess: () => {
        toast.success('Password updated successfully')
        form.reset()
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto">
        {errors && <CustomAlert variant="error" description={errors} />}
        <div className="my-8">
          <h2 className="text-2xl font-bold ">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Update your account password.
          </p>
          <Separator />
        </div>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
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
    </div>
  )
}
