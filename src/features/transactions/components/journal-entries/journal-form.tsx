import { useRouter } from '@tanstack/react-router'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import type { UseNavigateResult } from '@tanstack/react-router'

import type {
  JournalEntry,
  JournalFormValues,
} from '@/features/transactions/utils/transactions.types'

import type { Option } from '@/types/index.types'
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
import { Button } from '@/components/ui/button'
import FormActions from '@/components/custom/form.actions'
import { CustomAlert } from '@/components/custom/custom-alert'
import { Label } from '@/components/ui/label'

import { dateFormat, numberFormat } from '@/lib/formatters'
import { generateUniqueString } from '@/lib/utils'
import { journalFormSchema } from '@/features/transactions/utils/schema'
import { useFormReset } from '@/hooks/use-form-reset'
import { useError } from '@/hooks/use-error'
import { createEntry, deleteEntry } from '@/features/transactions/services/api'

import { Skeleton } from '@/components/ui/skeleton'
import { formErrorHandler, mutationErrorHandler } from '@/lib/error-handlers'
import { Separator } from '@/components/ui/separator'

interface JournalFormProps {
  accounts: Array<Option>
  journalNo: number
  navigate: UseNavigateResult<'/journal-entries'>
  transactionId?: string
  journal?: JournalEntry
}

const initialDetails = {
  id: generateUniqueString(5),
  glAccountId: '',
  debit: 0,
  credit: 0,
  description: '',
}

export function JournalForm({
  accounts,
  journalNo,
  transactionId,
  journal,
  navigate,
}: JournalFormProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const form = useForm<JournalFormValues>({
    defaultValues: {
      transactionDate: journal?.transactionDate || new Date(),
      details: journal?.details.map(
        ({ credit, debit, description, id, account }) => ({
          id: id.toString(),
          glAccountId: account.id.toString(),
          debit: debit || 0,
          credit: credit || 0,
          description: description || '',
        }),
      ) || [initialDetails],
    },
    resolver: zodResolver(journalFormSchema),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'details',
  })

  const [details] = useWatch({ control: form.control, name: ['details'] })
  const { totalCredits, totalDebits } = details.reduce(
    (acc, cur) => {
      acc.totalDebits += Number(cur.debit || 0)
      acc.totalCredits += Number(cur.credit || 0)
      return acc
    },
    { totalDebits: 0, totalCredits: 0 },
  )
  const reset = useFormReset<JournalFormValues>()
  const { clearErrors, errors, onError } = useError()

  const createUpdateMutation = useMutation({
    mutationFn: async ({
      values,
      txnId,
    }: {
      values: JournalFormValues
      txnId?: string
    }) => {
      await createEntry(values, txnId)
    },
    onError: (err) => formErrorHandler(err, form.setError, onError),
    onSuccess: () => formReset('save'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (txnId: string) => {
      await deleteEntry(txnId)
    },
    onError: (err) => {
      const error = mutationErrorHandler(err)
      onError(error)
    },
    onSuccess: () => formReset('delete'),
  })

  function formReset(transactionType: 'save' | 'delete') {
    reset(form, clearErrors)
    queryClient.invalidateQueries({ queryKey: ['journals'] })
    queryClient.invalidateQueries({
      queryKey: ['journal entries', 'journal no'],
    })
    router.invalidate({
      filter: (route) => route.id === '/_authenticated/journal-entries/',
    })
    toast.success(`Journal entry ${transactionType}d successfully!`)
    if (transactionId) {
      navigate({ search: { journalNo: undefined } })
    }
  }

  const isPending = createUpdateMutation.isPending || deleteMutation.isPending

  function onSubmit(values: JournalFormValues) {
    clearErrors()
    const formattedValues = {
      ...values,
      details: values.details.map((detail) => ({
        ...detail,
        credit: detail.credit ?? 0,
        debit: detail.debit ?? 0,
      })),
    }
    createUpdateMutation.mutate({
      values: formattedValues,
      txnId: transactionId,
    })
  }

  return (
    <div className="space-y-4">
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/2">
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={dateFormat(field.value)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>Journal No</Label>
              <Input type="number" value={journalNo} disabled />
            </div>
          </div>
          <Separator className="col-full" />
          <div className="mb-4 overflow-x-auto col-full">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-[5%]">#</th>
                  <th className="text-left py-2 px-2 w-[30%]">
                    <div className="flex items-center gap-1">Account</div>
                  </th>
                  <th className="text-right py-2 px-2">Debits</th>
                  <th className="text-right py-2 px-2">Credits</th>
                  <th className="text-left py-2 px-2 w-[30%]">Description</th>
                  <th className="w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f, index) => (
                  <tr key={f.id} className="border-b border-gray-200">
                    <td className="py-2 px-2 w-[5%]">{index + 1}</td>
                    <td className="py-2 px-2 w-[30%]">
                      <FormField
                        control={form.control}
                        name={`details.${index}.glAccountId`}
                        render={({ field: { onChange, value } }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <CustomSelect
                                defaultValue={value}
                                options={accounts}
                                value={value}
                                onChange={onChange}
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <FormField
                        control={form.control}
                        name={`details.${index}.debit`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input
                                type="number"
                                className="text-right"
                                {...field}
                                value={field.value || ''}
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <FormField
                        control={form.control}
                        name={`details.${index}.credit`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input
                                type="number"
                                className="text-right"
                                {...field}
                                value={field.value || ''}
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-2 px-2 w-[30%]">
                      <FormField
                        control={form.control}
                        name={`details.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Description"
                                {...field}
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-2 w-[5%]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400"
                        onClick={() => remove(index)}
                        type="button"
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {fields.length > 0 && (
                  <tr className="py-3">
                    <td
                      colSpan={2}
                      className="text-sm font-medium text-right py-1.5"
                    >
                      Totals
                    </td>
                    <td className="text-right text-sm text-muted-foreground">
                      {totalDebits ? numberFormat(totalDebits) : ''}
                    </td>
                    <td className="text-right text-sm text-muted-foreground">
                      {totalCredits ? numberFormat(totalCredits) : ''}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-sm"
                        type="button"
                        onClick={() => append(initialDetails)}
                        disabled={isPending}
                      >
                        Add lines
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm"
                        onClick={() => form.setValue('details', [])}
                        type="button"
                        disabled={isPending}
                      >
                        Clear all lines
                      </Button>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div
            className={clsx('', {
              'flex items-center justify-between': !!transactionId,
            })}
          >
            {transactionId && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteMutation.mutate(transactionId)}
              >
                Delete
              </Button>
            )}
            <FormActions
              isEdit={false}
              isPending={isPending}
              resetFn={() => reset(form, clearErrors)}
              defaultButtonNames
            />
          </div>
        </form>
      </Form>
    </div>
  )
}

export function JournalFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="w-full sm:w-1/2 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-10 py-2 px-2">#</th>
              <th className="text-left py-2 px-2">Account</th>
              <th className="text-right py-2 px-2">Debits</th>
              <th className="text-right py-2 px-2">Credits</th>
              <th className="text-left py-2 px-2">Description</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(2)].map((_, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2">
                  <Skeleton className="h-10 w-full" />
                </td>
                <td className="py-2 px-2">
                  <Skeleton className="h-10 w-full" />
                </td>
                <td className="py-2 px-2">
                  <Skeleton className="h-10 w-full" />
                </td>
                <td className="py-2 px-2">
                  <Skeleton className="h-10 w-full" />
                </td>
                <td className="py-2 px-2">
                  <Skeleton className="h-6 w-6 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}
