/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type {
  AccountFormValues,
  AccountMin,
  AccountValue,
} from '@/features/transactions/utils/transactions.types'
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
import { Checkbox } from '@/components/ui/checkbox'
import FormActions from '@/components/custom/form.actions'
import { CustomAlert } from '@/components/custom/custom-alert'

import { accountsFormSchema } from '@/features/transactions/utils/schema'
import { useFormReset } from '@/hooks/use-form-reset'
import { useError } from '@/hooks/use-error'
import { useMutate } from '@/hooks/use-mutate'
import {
  createAccount,
  updateAccount,
} from '@/features/transactions/services/api'
import { formErrorHandler } from '@/lib/error-handlers'
import { successHandler } from '@/lib/utils'
// import { createAccount, updateAccount } from '@/features/finance/services/api';

const ACCOUNT_TYPES = [
  {
    value: '1',
    label: 'Income',
  },
  {
    value: '2',
    label: 'Expense',
  },
  {
    value: '3',
    label: 'Asset',
  },
  {
    value: '4',
    label: 'Liability',
  },
  {
    value: '5',
    label: 'Dividend',
  },
  {
    value: '6',
    label: 'Equity',
  },
]

interface AccountsFormProps {
  accounts: Array<AccountMin>
  account?: AccountValue
}

export function AccountsForm({ accounts, account }: AccountsFormProps) {
  const isEdit = !!account?.id
  const form = useForm<AccountFormValues>({
    defaultValues: {
      name: account?.name || '',
      accountTypeId: account?.accountTypeId.toString() || '',
      isSubcategory: account?.isSubcategory || false,
      parentId: account?.parentId?.toString() || '',
      description: account?.description || '',
      active: account?.active || true,
    },
    resolver: zodResolver(accountsFormSchema),
  })
  const [accountTypeId, isSubcategory] = useWatch({
    control: form.control,
    name: ['accountTypeId', 'isSubcategory', 'parentId'],
  })

  const { isPending, mutate } = useMutate(
    createAccount,
    account?.id.toString(),
    updateAccount,
  )

  const reset = useFormReset<AccountFormValues>()
  const { clearErrors, errors, onError } = useError()
  const filteredAccounts = accounts
    .filter((acc) => acc.accountTypeId === accountTypeId && !acc.isSubcategory)
    .map(({ id, name }) => ({
      label: name.toUpperCase(),
      value: id.toString(),
    }))

  console.log(
    `accounts: ${accounts}`,
    `accountTypeId: ${accountTypeId}`,
    `filteredAccounts: ${filteredAccounts}`,
  )

  function onSubmit(data: AccountFormValues) {
    clearErrors()
    mutate(data, {
      onError: (err) => formErrorHandler(err, form.setError, onError),
      onSuccess: () =>
        successHandler(isEdit, ['accounts'], '/chart-of-accounts', 'account'),
    })
  }

  return (
    <div className="space-y-6">
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter account name"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <FormControl>
                  <CustomSelect
                    options={ACCOUNT_TYPES}
                    defaultValue={field.value?.toString()}
                    {...field}
                    value={field.value?.toString()}
                    onChange={field.onChange}
                    placeholder="Select account type"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isSubcategory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(value: boolean) => {
                      field.onChange(value)
                      form.setValue('parentId', undefined)
                    }}
                    disabled={isPending}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Sub category of</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value?.toString()}
                    options={
                      isSubcategory && !!accountTypeId ? filteredAccounts : []
                    }
                    value={field.value?.toString()}
                    onChange={(value: string) => {
                      if (!value) return
                      field.onChange(value.toString())
                    }}
                    disabled={!isSubcategory || isPending}
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
                    disabled={isPending}
                    placeholder="Enter account description....optional"
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}

          <FormActions
            isPending={isPending}
            defaultButtonNames
            isEdit={isEdit}
            resetFn={() => reset(form, clearErrors)}
          />
        </form>
      </Form>
    </div>
  )
}
