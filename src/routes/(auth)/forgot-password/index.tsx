import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosResponse } from 'axios'
import { useDocumentTitle } from '@/hooks/use-title'
import { requiredStringSchemaEntry } from '@/lib/schema-rules'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useError } from '@/hooks/use-error'
import { CustomAlert } from '@/components/custom/custom-alert'
import { formErrorHandler } from '@/lib/error-handlers'
import { ErrorNotification } from '@/components/custom/error-component'
import axios from '@/lib/api/axios'

export const Route = createFileRoute('/(auth)/forgot-password/')({
  validateSearch: z.object({
    errorCode: z
      .enum(['INVALID_TOKEN', 'UNKNOWN_ERROR', 'EXPIRED_TOKEN'])
      .optional(),
  }),
  component: ForgorPasswordRouteComponent,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})
function ForgorPasswordRouteComponent() {
  useDocumentTitle('Forgot Password ')
  const { errorCode } = Route.useSearch()
  const navigate = useNavigate()
  const form = useForm<{ email: string }>({
    defaultValues: { email: '' },
    resolver: zodResolver(
      z.object({
        email: requiredStringSchemaEntry('Provide an email address').email(
          'Invalid email address',
        ),
      }),
    ),
  })
  const { clearErrors, errors, onError } = useError()
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response: AxiosResponse<{ token: string }> = await axios.post(
        '/api/forgot-password',
        data,
      )

      return response.data.token
    },
  })

  useEffect(function () {
    if (errorCode) {
      switch (errorCode) {
        case 'INVALID_TOKEN':
          onError('The reset token is invalid. Please try again.')
          break
        case 'EXPIRED_TOKEN':
          onError('The reset token has expired. Enter email and submit.')
          break
        case 'UNKNOWN_ERROR':
          onError('An unknown error occurred. Please try again later.')
          break
        default:
          onError('An unexpected error occurred. Please try again.')
          break
      }
    }
  }, [])

  function onSubmit(data: { email: string }) {
    clearErrors()
    mutate(data, {
      onError: (err) => formErrorHandler(err, form.setError, onError),
      onSuccess: (token) => {
        form.reset()
        navigate({
          to: '/forgot-password/reset-code',
          search: { resetToken: token },
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-0.5  mt-2 mb-6">
        <h2 className="text-center text-2xl/9 font-bold tracking-tight">
          Forgot your password
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-prose">
          Enter your email address below and we will send you a link to reset
          your password.
        </p>
      </div>
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
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
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            Send Reset Link
          </Button>
        </form>
      </Form>
    </div>
  )
}
