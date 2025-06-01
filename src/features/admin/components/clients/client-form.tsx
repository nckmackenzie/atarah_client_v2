import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'

import type {
  Client,
  ClientFormValues,
} from '@/features/admin/utils/admin.types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { CustomAlert } from '@/components/custom/custom-alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useMutate } from '@/hooks/use-mutate'
import { createClient, updateClient } from '@/features/admin/services/api'
import { useFormReset } from '@/hooks/use-form-reset'
import { useError } from '@/hooks/use-error'
import { customerFormSchema } from '@/features/admin/utils/schemas'
import { handleApiErrors, mutationErrorHandler } from '@/lib/error-handlers'
import { successHandler } from '@/lib/utils'
import FormActions from '@/components/custom/form.actions'
import FormHeader from '@/components/custom/form-header'

interface ClientFormProps {
  client?: Client
}

export default function ClientForm({ client }: ClientFormProps) {
  const isEdit = !!client?.id
  const { isPending, mutate } = useMutate(
    createClient,
    client?.id,
    updateClient,
  )
  const reset = useFormReset<ClientFormValues>()
  const { clearErrors, onError, errors } = useError()

  const form = useForm<ClientFormValues>({
    defaultValues: {
      address: client?.address || '',
      contact: client?.contact || '',
      email: client?.email || '',
      name: client?.name.toUpperCase() || '',
      taxPin: client?.taxPin?.toUpperCase() || '',
      openingBalance: 0,
      active: true,
    },
    resolver: zodResolver(customerFormSchema),
  })

  function onSubmit(values: ClientFormValues) {
    clearErrors()
    mutate(values, {
      onError: (err) => {
        if (isAxiosError(err)) {
          if (err.response?.status === 422) {
            handleApiErrors(err.response.data.errors, form.setError)
          } else {
            onError(mutationErrorHandler(err))
          }
        }
      },
      onSuccess: () => {
        successHandler(isEdit, ['clients'], '/clients', 'client')
      },
    })
  }

  return (
    <div className="space-y-6">
      <FormHeader
        title={`${isEdit ? 'Update client' : 'Create client'}`}
        description={`${isEdit ? 'Provide details you want to update for this client.' : 'Fill in the details to create a new client.'}`}
      />
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 items-start gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="form-col">
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Client Name"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="form-col">
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="test@example.com"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem className="form-col">
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="0700000000"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxPin"
            render={({ field }) => (
              <FormItem className="form-col">
                <FormLabel>Tax PIN</FormLabel>
                <FormControl>
                  <Input
                    maxLength={11}
                    {...field}
                    placeholder="P123456789X"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Client address"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isEdit && (
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="airplane-mode">
                      {form.watch('active') ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </FormItem>
              )}
            />
          )}
          <FormActions
            isPending={isPending}
            className="col-span-full"
            resetFn={() => reset(form, clearErrors)}
            defaultButtonNames
            isEdit={isEdit}
          />
        </form>
      </Form>
    </div>
  )
}
