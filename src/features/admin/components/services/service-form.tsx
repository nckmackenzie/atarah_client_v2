import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type {
  Service,
  ServiceFormValues,
} from '@/features/admin/utils/admin.types'
import type { Option } from '@/types/index.types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CustomAlert } from '@/components/custom/custom-alert'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import { serviceFormSchema } from '@/features/admin/utils/schemas'
import { useFormReset } from '@/hooks/use-form-reset'
import { useMutate } from '@/hooks/use-mutate'
import { useError } from '@/hooks/use-error'
import CustomSelect from '@/components/custom/custom-select'
import FormActions from '@/components/custom/form.actions'
import { createService, updateService } from '@/features/admin/services/api'
import { formErrorHandler } from '@/lib/error-handlers'
import { successHandler } from '@/lib/utils'

interface ServiceFormProps {
  service?: Service
  accounts: Array<Option>
}

export function ServiceForm({ accounts, service }: ServiceFormProps) {
  const isEdit = !!service

  const form = useForm<ServiceFormValues>({
    defaultValues: {
      description: service?.description?.toUpperCase() || '',
      name: service?.name.toUpperCase() || '',
      rate: service?.rate || 0,
      glAccountId: service?.account.id.toString() || '',
      active: service?.active || true,
    },
    resolver: zodResolver(serviceFormSchema),
  })
  const reset = useFormReset<ServiceFormValues>()
  const [active] = useWatch({ control: form.control, name: ['active'] })
  const { isPending, mutate } = useMutate(
    createService,
    service?.id,
    updateService,
  )
  const { clearErrors, errors, onError } = useError()

  function onSubmit(values: ServiceFormValues) {
    clearErrors()
    mutate(values, {
      onError: (err) => {
        formErrorHandler(err, form.setError, onError)
      },
      onSuccess: () => {
        successHandler(isEdit, ['services'], '/services', 'service')
      },
    })
  }

  return (
    <div className="y-spacing">
      {errors ||
        (errors && <CustomAlert variant="error" description={errors} />)}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="eg Consultion services"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Rate</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="20000"
                    disabled={isPending}
                    value={field.value === 0 ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="description for service...optional"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="glAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>G/L Account</FormLabel>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value}
                    options={accounts}
                    // options={transformOptions(
                    //   accounts.data.filter((acc) => acc.parentId !== null),
                    // )}
                    {...field}
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
                        disabled={isPending}
                      />
                    </FormControl>
                    <Label htmlFor="active">
                      {active ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </FormItem>
              )}
            />
          )}

          <FormActions
            isEdit={isEdit}
            isPending={isPending}
            resetFn={() => reset(form, clearErrors)}
          />
        </form>
      </Form>
    </div>
  )
}
