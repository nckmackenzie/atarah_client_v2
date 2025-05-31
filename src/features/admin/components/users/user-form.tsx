// import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import type { Option } from '@/types/index.types'
import type { User, UserFormValues } from '@/features/admin/utils/admin.types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import CustomSelect from '@/components/custom/custom-select'
import { CustomAlert } from '@/components/custom/custom-alert'
import FormActions from '@/components/custom/form.actions'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import { usersFormSchema } from '@/features/admin/utils/schemas'
import { useFormReset } from '@/hooks/use-form-reset'
import { useError } from '@/hooks/use-error'
import { useMutate } from '@/hooks/use-mutate'
import axios from '@/lib/api/axios'
import { handleApiErrors, mutationErrorHandler } from '@/lib/error-handlers'
import { getContext } from '@/integrations/tanstack-query/root-provider'

interface UserFormProps {
  loaderRoles: Array<Option>
  user?: User
}

export default function UserForm({ loaderRoles, user }: UserFormProps) {
  const isEdit = !!user?.id
  const reset = useFormReset<UserFormValues>()
  const navigate = useNavigate()
  const { queryClient } = getContext()
  const { clearErrors, errors, onError } = useError()
  const { isPending, mutate } = useMutate(async (values: UserFormValues) => {
    await axios.post('/api/users', values)
  })

  const form = useForm<UserFormValues>({
    defaultValues: {
      name: user?.name.toUpperCase() || '',
      roleId: user?.role?.id || undefined,
      contact: user?.contact || '',
      email: user?.email || '',
      userType: user?.userType || 'user',
      active: user?.active || true,
    },
    resolver: zodResolver(usersFormSchema),
  })

  const userType = useWatch({ control: form.control, name: 'userType' })

  function onSubmit(values: UserFormValues) {
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
        toast.success(`${isEdit ? 'Updated' : 'Created'} user successfully!`)
        queryClient.invalidateQueries({
          queryKey: ['users'],
        })
        navigate({ to: '/users' })
      },
    })
  }

  return (
    <div className="space-y-6">
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Enter full name"
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
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={10}
                    disabled={isPending}
                    placeholder="Enter phone no"
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
              <FormItem className="col-span-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    disabled={isPending}
                    placeholder="Enter user email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Type</FormLabel>
                <FormControl>
                  <CustomSelect
                    {...field}
                    options={[
                      { value: 'admin', label: 'Admin' },
                      { value: 'user', label: 'User' },
                    ]}
                    defaultValue={field.value}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <CustomSelect
                    placeholder="Select role for this user..."
                    {...field}
                    options={loaderRoles}
                    hasError={!!form.formState.errors.roleId?.message}
                    disabled={userType === 'admin' || isPending}
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
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="change-status"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                      <Label
                        htmlFor="change-status"
                        className={
                          !field.value
                            ? 'text-success-foreground'
                            : 'text-danger-foreground'
                        }
                      >
                        {field.value ? 'Deactivate' : 'Activate'} User
                      </Label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <FormActions
            isEdit={isEdit}
            isPending={isPending}
            className="col-span-full"
            resetFn={() => {
              reset(form, clearErrors)
            }}
          />
        </form>
      </Form>
    </div>
  )
}
