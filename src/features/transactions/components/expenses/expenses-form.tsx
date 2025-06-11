import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Dropzone from 'react-dropzone'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CloudUploadIcon,
  FileIcon,
  ImageIcon,
  PaperclipIcon,
  Trash2Icon,
  X,
} from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'

import type {
  ExpenseFormValues,
  ExpenseWithAttachments,
} from '@/features/transactions/utils/transactions.types'
import type { IsPending, Option } from '@/types/index.types'

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
import { Separator } from '@/components/ui/separator'
import { CustomAlert } from '@/components/custom/custom-alert'
import { Button } from '@/components/ui/button'

import { expenseFormSchema } from '@/features/transactions/utils/schema'
import {
  PAYMENT_METHOD,
  generateUniqueString,
  successHandler,
} from '@/lib/utils'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { useFormReset } from '@/hooks/use-form-reset'
import { useError } from '@/hooks/use-error'
import {
  createExpense,
  updateExpense,
} from '@/features/transactions/services/api'
import { useMutate } from '@/hooks/use-mutate'
import { Label } from '@/components/ui/label'
import FormActions from '@/components/custom/form.actions'
import { formErrorHandler } from '@/lib/error-handlers'

const INITIAL_DETAILS = {
  id: generateUniqueString(10),
  glAccountId: '',
  amount: 0,
  narration: '',
  projectId: '',
}

interface ExpenseForm extends IsPending {
  form: UseFormReturn<ExpenseFormValues>
}

interface ExpenseFormProps {
  expense?: ExpenseWithAttachments
  expenseNo: number
  projects: Array<Option>
  accounts: Array<Option>
}

export function ExpenseForm({
  expense,
  expenseNo,
  accounts,
  projects,
}: ExpenseFormProps) {
  const isEdit = Boolean(expense)
  const queryClient = useQueryClient()
  const form = useForm<ExpenseFormValues>({
    defaultValues: {
      details: expense?.details.map(
        ({ account: { id: accountId }, amount, description, id, project }) => ({
          glAccountId: accountId.toString(),
          amount: Number(amount),
          description: description?.toUpperCase() || '',
          id: id.toString(),
          projectId: project ? project.id : '',
        }),
      ) || [{ ...INITIAL_DETAILS }],
      payee: expense?.payee.toUpperCase() || '',
      paymentMethod: expense?.paymentMethod || 'mpesa',
      paymentReference: expense?.paymentReference?.toUpperCase() || '',
      expenseDate: new Date(),
      attachments: [],
    },
    resolver: zodResolver(expenseFormSchema),
  })

  const [attachmentsToDelete, setAttachmentsToDelete] = useState<Array<number>>(
    [],
  )

  const reset = useFormReset<ExpenseFormValues>()
  const { clearErrors, errors, onError } = useError()
  const { isPending, mutate } = useMutate(
    createExpense,
    expense?.id,
    updateExpense,
  )

  function onSubmit(values: ExpenseFormValues) {
    clearErrors()
    if (values.details.length === 0) {
      onError('Please add expense details')
      return
    }
    mutate(
      { ...values, attachmentsToDelete },
      {
        onError: (error) => {
          formErrorHandler(error, form.setError, onError)
        },
        onSuccess: () => {
          if (isEdit) {
            queryClient.invalidateQueries({
              queryKey: ['expenses', expense?.id as string],
            })
          }
          successHandler(isEdit, ['expenses'], '/expenses', 'expense')
        },
      },
    )
  }

  const [details, attachments] = useWatch({
    control: form.control,
    name: ['details', 'attachments'],
  })

  const totalAmount = details.reduce(
    (acc, detail) => acc + (+detail.amount || 0),
    0,
  )

  return (
    <div className="space-y-6">
      {errors && <CustomAlert description={errors} variant="error" />}
      <div className="flex items-center justify-between">
        <div className="grid gap-2 w-full md:w-96">
          <Label>Expense No</Label>
          <Input readOnly value={expenseNo} />
        </div>
        <div className="grid gap-2 w-full md:w-96">
          <Label className="text-right block">Total Amount</Label>
          <Input
            readOnly
            value={numberFormat(totalAmount)}
            className="text-destructive"
            style={{ textAlign: 'right', fontSize: '32px', fontWeight: 500 }}
          />
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
        >
          <ExpenseHeader form={form} isPending={isPending} />
          <Separator className="col-span-full" />
          <ExpenseDetails
            form={form}
            isPending={isPending}
            accounts={accounts}
            projects={projects}
          />
          <Separator className="col-span-full" />
          <Attachments form={form} isPending={isPending} onError={onError} />
          {attachments && attachments.length > 0 && (
            <div className="col-full">
              <div className="flex items-center gap-2 mb-2">
                <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {attachments.length}{' '}
                  {attachments.length === 1 ? ' file ' : ' files '} attached
                </span>
              </div>
            </div>
          )}
          {!!expense?.attachments?.length &&
            expense.attachments
              .filter(({ id }) => !attachmentsToDelete.includes(id))
              .map(({ fileUrl, id }, index) => {
                const fileType = fileUrl.split('.').pop()
                return (
                  <div
                    key={id}
                    className="col-full bg-success-foreground/10 border-success-foreground/20 border rounded-md p-2 flex items-center justify-between"
                  >
                    <a
                      href={fileUrl}
                      target="_blank"
                      key={id}
                      className="flex items-center gap-2"
                    >
                      {fileType === 'pdf' ? (
                        <FileIcon size={24} />
                      ) : (
                        <ImageIcon size={24} />
                      )}
                      <p className="text-sm text-success-foreground">
                        Attachment-{index + 1}
                      </p>
                    </a>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6"
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        setAttachmentsToDelete((prev) => [...prev, id])
                      }
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )
              })}
          <FormActions
            isEdit={isEdit}
            isPending={isPending}
            resetFn={() => reset(form, clearErrors)}
            className="col-span-full"
          />
        </form>
      </Form>
    </div>
  )
}

function ExpenseHeader({ form, isPending }: ExpenseForm) {
  return (
    <>
      <FormField
        control={form.control}
        name="expenseDate"
        render={({ field }) => (
          <FormItem className="col-span-full md:col-span-3">
            <FormLabel>Expense Date</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                disabled={isPending}
                value={dateFormat(field.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="payee"
        render={({ field }) => (
          <FormItem className="col-span-full md:col-span-3">
            <FormLabel>Payee</FormLabel>
            <FormControl>
              <Input
                disabled={isPending}
                {...field}
                placeholder="Enter payee"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="col-span-full md:col-span-3">
            <FormLabel>Payment Method</FormLabel>
            <FormControl>
              <CustomSelect
                defaultValue={field.value}
                {...field}
                disabled={isPending}
                options={PAYMENT_METHOD}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="paymentReference"
        render={({ field }) => (
          <FormItem className="col-span-full md:col-span-3">
            <FormLabel>Payment Reference</FormLabel>
            <FormControl>
              <Input
                disabled={isPending}
                {...field}
                placeholder="Enter payment reference"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

interface ExpenseDetailsProps extends ExpenseForm {
  accounts: Array<Option>
  projects: Array<Option>
}

function ExpenseDetails({
  accounts,
  projects,
  form,
  isPending,
}: ExpenseDetailsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'details',
  })
  return (
    <div className="mb-4 overflow-x-auto col-full">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 w-[30%]">
              <div className="flex items-center gap-1">Expense Account</div>
            </th>
            <th className="text-left py-2 px-2 w-[20%]">Project</th>
            <th className="text-left py-2 px-2 w-[25%]">Description</th>
            <th className="text-right py-2 px-2 w-[20%]">Amount</th>
            <th className="w-[5%]"></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, index) => (
            <tr key={f.id} className="border-b border-gray-200">
              <td className="py-2 px-2 w-[30%]">
                <FormField
                  control={form.control}
                  name={`details.${index}.glAccountId`}
                  render={({ field: { onChange, value } }) => {
                    return (
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
                    )
                  }}
                />
              </td>
              <td className="py-2 px-2 w-[20%]">
                <FormField
                  control={form.control}
                  name={`details.${index}.projectId`}
                  render={({ field: { onChange, value } }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <CustomSelect
                          defaultValue={value}
                          options={projects}
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
              <td className="py-2 px-2 w-[25%]">
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
              <td className="py-2 px-2 w-[20%]">
                <FormField
                  control={form.control}
                  name={`details.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Amount"
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
              <td className="py-2 w-[5%]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400"
                  onClick={() => remove(index)}
                  type="button"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={3} className="py-3">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-sm"
                  type="button"
                  onClick={() => append(INITIAL_DETAILS)}
                >
                  Add lines
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => form.setValue('details', [])}
                  type="button"
                >
                  Clear all lines
                </Button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

interface AttachmentsProps extends ExpenseForm {
  onError: (message: string | Array<string>) => void
}

function Attachments({
  isPending,
  // onSetFile,
  onError,
  form,
}: AttachmentsProps) {
  return (
    <div className="mb-6 col-full">
      <div className="flex items-center gap-2 mb-2">
        <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">Attachments</span>
        <span className="text-xs text-muted-foreground">
          Maximum size: 20MB
        </span>
      </div>
      <div className="text-center">
        <Dropzone
          onDrop={(acceptedFiles) => {
            if (!acceptedFiles.length) return
            // onSetFile(acceptedFiles);
            form.setValue('attachments', acceptedFiles)
          }}
          disabled={isPending}
          maxFiles={1}
          multiple={true}
          onError={(err) => onError(err.message)}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'application/pdf': ['.pdf'],
          }}
          onDropRejected={() => onError('Invalid file type')}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps({
                className: 'dropzone border p-4 rounded-md text-center',
              })}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-sm text-muted-foreground">
                  Drop the files here ...
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <CloudUploadIcon className="icon-muted" />
                  <p className="text-sm text-muted-foreground">
                    <span className="text-link-foreground font-semibold cursor-pointer">
                      Click to upload or{' '}
                    </span>
                    drag 'n' drop some files here, or click to select files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG,JPG or JPEG (MAX: 2MB)
                  </p>
                </div>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  )
}
