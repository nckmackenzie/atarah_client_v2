import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { UseFormReturn } from 'react-hook-form'

import type { IsEditRequired, Option } from '@/types/index.types'
import type {
  InvoicePayment,
  InvoicePaymentBulkFormValues,
} from '@/features/transactions/utils/transactions.types'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import CustomSelect from '@/components/custom/custom-select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CustomAlert } from '@/components/custom/custom-alert'
import FormActions from '@/components/custom/form.actions'
import { Skeleton } from '@/components/ui/skeleton'

import { invoiceBulkPaymentFormSchema } from '@/features/transactions/utils/schema'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { useError } from '@/hooks/use-error'
import { createBulkPayment } from '@/features/transactions/services/api'
import { useMutate } from '@/hooks/use-mutate'
import { PAYMENT_METHOD } from '@/lib/utils'
import { useFormReset } from '@/hooks/use-form-reset'
import { pendingInvoiceByClientQueryOptions } from '@/features/transactions/services/query-options'
import { formErrorHandler } from '@/lib/error-handlers'

interface InvoicePaymentFormProps {
  payment?: InvoicePayment
  clients: Array<Option>
}

export function InvoicePaymentForm({
  payment,
  clients,
}: InvoicePaymentFormProps) {
  const isEdit = !!payment
  const { isPending, mutate } = useMutate(createBulkPayment)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const reset = useFormReset<InvoicePaymentBulkFormValues>()
  const { clearErrors, onError, errors } = useError()
  const form = useForm<InvoicePaymentBulkFormValues>({
    defaultValues: {
      clientId: '',
      paymentMethod: 'cheque',
      paymentReference: '',
      invoices: [],
      paymentDate: new Date(),
    },
    resolver: zodResolver(invoiceBulkPaymentFormSchema),
  })
  const [clientId, invoices] = useWatch({
    control: form.control,
    name: ['clientId', 'invoices'],
  })

  const {
    data: pendingInvoices,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    ...pendingInvoiceByClientQueryOptions(clientId),
    enabled: !!clientId,
  })

  useEffect(() => {
    if (invoicesError) {
      onError(invoicesError.message)
    }
  }, [invoicesError, onError])

  useEffect(() => {
    if (pendingInvoices?.data) {
      const formatted = pendingInvoices.data.map(
        ({ id, invoiceDate, invoiceNo, totalAmount }) => ({
          invoiceId: id,
          invoiceNo: invoiceNo,
          invoiceAmount: numberFormat(totalAmount),
          invoiceDate: dateFormat(invoiceDate, 'long'),
          amount: 0,
        }),
      )
      form.setValue('invoices', formatted)
    }
  }, [pendingInvoices?.data, form])

  function onSubmit(values: InvoicePaymentBulkFormValues) {
    clearErrors()
    mutate(values, {
      onError: (err) => formErrorHandler(err, form.setError, onError),
      onSuccess: () => {
        toast.success('Invoices payments made successfully!')
        queryClient.invalidateQueries({
          queryKey: ['invoices', 'pending', clientId],
        })
        queryClient.invalidateQueries({ queryKey: ['invoices', 'payments'] })
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
        navigate({ to: '/invoices/payments' })
      },
      // successHandler(
      //   isEdit,
      //   ['invoice payments'],
      //   '/invoices/payments',
      //   'invoice payment',
      // ),
    })
  }

  const totalAmount = invoices.reduce((acc, cur) => acc + Number(cur.amount), 0)

  return (
    <div className="y-spacing">
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="form-grid">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem className="col-span-full md:col-span-6">
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value}
                    options={clients}
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="hidden md:block md:col-span-4 " />
          <div className="hidden md:grid md:col-span-2 gap-2">
            <Label>Amount Received</Label>
            <div className="input">{numberFormat(totalAmount)}</div>
          </div>
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Payment Date</FormLabel>
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
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <CustomSelect
                    options={PAYMENT_METHOD}
                    {...field}
                    disabled={isPending}
                    defaultValue={field.value}
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
              <FormItem className="col-span-4">
                <FormLabel>Payment Reference</FormLabel>
                <FormControl>
                  <Input type="text" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <PaymentDetails
            form={form}
            isPending={isPending}
            isEdit={isEdit}
            isLoadingInvoices={isLoadingInvoices}
            clientId={clientId}
          />
          <FormActions
            isEdit={isEdit}
            isPending={isPending}
            resetFn={() => reset(form, clearErrors)}
            className="col-full"
          />
        </form>
      </Form>
    </div>
  )
}

interface DetailsProps extends IsEditRequired {
  isPending: boolean
  isLoadingInvoices: boolean
  clientId: string
  form: UseFormReturn<InvoicePaymentBulkFormValues>
}

function PaymentDetails({
  form,
  isPending,
  isLoadingInvoices,
  clientId,
}: DetailsProps) {
  const { fields } = useFieldArray({
    control: form.control,
    name: 'invoices',
  })

  return (
    <div className="mb-4 overflow-x-auto col-full">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 w-[25%]">
              <div className="flex items-center gap-1">Invoice #</div>
            </th>
            <th className="text-left py-2 px-2 w-[25%]">Invoice Date</th>
            <th className="text-right py-2 px-2 w-[25%]">Invoice Amount</th>
            <th className="text-right py-2 px-2 w-[25%]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {!clientId ? (
            <tr>
              <td
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                Please select a customer to view pending invoices
              </td>
            </tr>
          ) : isLoadingInvoices ? (
            Array.from({ length: 3 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-200">
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
              </tr>
            ))
          ) : fields.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                No pending invoices found for this customer
              </td>
            </tr>
          ) : (
            fields.map((item, index) => {
              return (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 px-2 w-[25%]">
                    <FormField
                      control={form.control}
                      name={`invoices.${index}.invoiceNo`}
                      render={({ field: { value } }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              readOnly
                              value={value}
                              disabled={isPending}
                              className="border-none"
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
                      name={`invoices.${index}.invoiceDate`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              readOnly
                              value={field.value}
                              disabled={isPending}
                              className="border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="py-2 px-2 w-[25%] text-right">
                    <FormField
                      control={form.control}
                      name={`invoices.${index}.invoiceAmount`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              readOnly
                              value={field.value}
                              disabled={isPending}
                              className="border-none text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="text-center w-[25%]">
                    <FormField
                      control={form.control}
                      name={`invoices.${index}.amount`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount to pay..."
                              className="text-right"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                field.onChange(value)
                              }}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
