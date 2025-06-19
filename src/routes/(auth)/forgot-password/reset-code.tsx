import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { ErrorNotification } from '@/components/custom/error-component'
import { requiredStringSchemaEntry } from '@/lib/schema-rules'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useDocumentTitle } from '@/hooks/use-title'
import axios from '@/lib/api/axios'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { useError } from '@/hooks/use-error'
import { CustomAlert } from '@/components/custom/custom-alert'
import { formErrorHandler } from '@/lib/error-handlers'

const FormSchema = z.object({
  code: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
})

export const Route = createFileRoute('/(auth)/forgot-password/reset-code')({
  validateSearch: z.object({
    resetToken: requiredStringSchemaEntry('Reset token is missing'),
  }),
  loaderDeps: ({ search: { resetToken } }) => ({ resetToken }),
  loader: async ({ deps: { resetToken } }) => {
    if (!resetToken) {
      throw new Error('Reset token is required')
    }

    try {
      await axios(
        `/api/forgot-password/validate-token?resetToken=${resetToken}`,
      )
    } catch (error) {
      if (isAxiosError(error)) {
        const errorCode = error.response?.data.code || 'UNKNOWN_ERROR'
        throw redirect({
          to: '/forgot-password',
          search: { errorCode },
          replace: true,
        })
      }
    }
  },
  component: ForgotPasswordResetRouteComponent,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
  pendingComponent: () => <AuthedPageLoader />,
})

function ForgotPasswordResetRouteComponent() {
  useDocumentTitle('Forgot Password Reset Code')
  const resetToken = Route.useSearch().resetToken
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: '',
    },
  })
  const { clearErrors, errors, onError } = useError()
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const { code } = data

      await axios.post(`/api/forgot-password/${resetToken}/validate`, {
        code,
      })
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    clearErrors()
    mutate(data, {
      onError: (error) => formErrorHandler(error, form.setError, onError),
      onSuccess: () => {
        navigate({
          to: '/reset-password',
          search: { resetToken },
          replace: true,
        })
      },
    })
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="space-y-0.5  mt-2 mb-6">
        <h2 className="text-center text-2xl/9 font-bold tracking-tight">
          Enter reset Code
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-prose">
          Enter the reset code sent to your email address.
        </p>
      </div>
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    disabled={isPending}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  )
}
