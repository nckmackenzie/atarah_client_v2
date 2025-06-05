/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays } from 'date-fns'
import { Trash2Icon } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'

import type { Service } from '@/features/admin/utils/admin.types'
import type { Option } from '@/types/index.types'
import type {
  InvoiceFormValues,
  InvoiceWithDetails,
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
import { CustomAlert } from '@/components/custom/custom-alert'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

import { invoiceFormSchema } from '@/features/transactions/utils/schema'
import {
  createInvoice,
  updateInvoice,
} from '@/features/transactions/services/api'
import { dateFormat } from '@/lib/formatters'
import { useError } from '@/hooks/use-error'
import { useMutate } from '@/hooks/use-mutate'
import FormActions from '@/components/custom/form.actions'
import { useFormReset } from '@/hooks/use-form-reset'
import { Button } from '@/components/ui/button'
import { generateUniqueString, successHandler } from '@/lib/utils'
import { formErrorHandler } from '@/lib/error-handlers'

export const TERMS = [
  { value: '0', label: 'Due on Receipt' },
  { value: '30', label: '30 Days' },
  { value: '60', label: '60 Days' },
]

export const VAT_TYPES = [
  { value: 'no_vat', label: 'No VAT' },
  { value: 'inclusive', label: 'Inclusive VAT' },
  { value: 'exclusive', label: 'Exclusive VAT' },
]

interface InvoiceFormProps {
  invoice?: InvoiceWithDetails
  services: Array<Service>
  clients: Array<Option>
  cloned?: boolean
}

const initialItems = {
  id: generateUniqueString(10),
  serviceId: '',
  quantity: 1,
  rate: 0,
  discount: 0,
}

function calculateNetAmount(
  quantity: number,
  rate: number,
  discount: number,
): number {
  const total = quantity * rate
  return total - discount
}

export function InvoiceForm({
  invoice,
  clients,
  services,
  cloned,
}: InvoiceFormProps) {
  const isEdit = !!invoice
  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      invoiceNo: cloned ? '' : invoice?.invoiceNo || '',
      clientId: invoice?.client.id || '',
      items: invoice?.details.map(
        ({ id, rate, discount, quantity, service: { id: serviceId } }) => ({
          discount: +discount.toString(),
          serviceId,
          id: id.toString(),
          quantity: +quantity.toString(),
          rate: +rate.toString(),
        }),
      ) || [{ ...initialItems }],
      vatType: invoice?.vatType || 'no_vat',
      vat: invoice?.vat ? +invoice.vat.toString() : undefined,
      terms: invoice?.terms || '0',
      invoiceDate: cloned
        ? new Date()
        : invoice?.invoiceDate
          ? new Date(invoice.invoiceDate)
          : new Date(),
      dueDate: cloned
        ? addDays(new Date(), invoice?.terms ? +invoice.terms : 0)
        : invoice?.dueDate
          ? new Date(invoice.dueDate)
          : addDays(new Date(), 0),
    },
    resolver: zodResolver(invoiceFormSchema),
  })
  const reset = useFormReset<InvoiceFormValues>()
  const { clearErrors, errors, onError } = useError()
  const { isPending, mutate } = useMutate(
    createInvoice,
    invoice?.id,
    updateInvoice,
  )
  const [invoiceDate, vatType] = useWatch({
    control: form.control,
    name: ['invoiceDate', 'vatType'],
  })

  function onSubmit(values: InvoiceFormValues) {
    clearErrors()
    mutate(values, {
      onError: (err) => formErrorHandler(err, form.setError, onError),
      onSuccess: () =>
        successHandler(isEdit, ['invoices'], '/invoices', 'invoice'),
    })
  }

  return (
    <div className="space-y-6">
      {errors && <CustomAlert description={errors} variant="error" />}
      <Form {...form}>
        <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="invoiceNo"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-4">
                <FormLabel>Invoice No</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-4">
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

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-4">
                <FormLabel>Terms</FormLabel>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value}
                    options={TERMS}
                    {...field}
                    value={field.value?.toString()}
                    disabled={isPending}
                    onChange={(value: string) => {
                      field.onChange(value)

                      if (invoiceDate) {
                        const newDueDate = addDays(invoiceDate, Number(value))
                        form.setValue('dueDate', newDueDate)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-3">
                <FormLabel>Invoice Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isPending}
                    value={field.value ? dateFormat(field.value) : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newDate = new Date(e.target.value)
                      field.onChange(newDate)

                      const currentTerms = form.getValues('terms')
                      const newDueDate = addDays(
                        newDate,
                        Number(currentTerms || 0),
                      )
                      form.setValue('dueDate', newDueDate)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-3">
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={isPending}
                    {...field}
                    value={field.value ? dateFormat(field.value) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vatType"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-3">
                <FormLabel>Terms</FormLabel>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value}
                    options={VAT_TYPES}
                    {...field}
                    disabled={isPending}
                    onChange={(value: string) => {
                      field.onChange(value)
                      if (value === 'no_vat') {
                        form.setValue('vat', undefined)
                        form.trigger('vat')
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vat"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-3">
                <FormLabel>VAT</FormLabel>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value?.toString()}
                    placeholder="Select VAT"
                    options={[{ label: 'VAT-16%', value: '16' }]}
                    {...field}
                    value={field.value?.toString()}
                    disabled={vatType === 'no_vat' || isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="col-span-full" />
          <Details form={form} isPending={isPending} services={services} />
          <Separator className="col-span-full" />
          {/* <Totals form={form} /> */}
          <FormActions
            isPending={isPending}
            resetFn={() => reset(form, clearErrors)}
            isEdit={isEdit}
            className="col-span-full"
          />
        </form>
      </Form>
    </div>
  )
}

interface DetailsProps {
  isPending: boolean
  services: Array<Service>
  form: UseFormReturn<InvoiceFormValues>
}

function Details({ services, form, isPending }: DetailsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const watchedItems = useWatch({
    control: form.control,
    name: 'items',
  })

  return (
    <div className="mb-4 overflow-x-auto col-full">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 w-[35%]">
              <div className="flex items-center gap-1">Service</div>
            </th>
            <th className="text-left py-2 px-2 w-[15%]">Qty</th>
            <th className="text-left py-2 px-2 w-[15%]">Rate</th>
            <th className="text-right py-2 px-2 w-[15%]">Discount</th>
            <th className="text-left py-2 px-2 w-[15%]">Amount</th>
            <th className="w-[5%]"></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((item, index) => {
            const currentItem = watchedItems?.[index] || {}
            const quantity = currentItem.quantity || 0
            const rate = currentItem.rate || 0
            const discount = currentItem.discount || 0
            const amount = calculateNetAmount(quantity, rate, discount)

            return (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2 px-2 w-[35%]">
                  <FormField
                    control={form.control}
                    name={`items.${index}.serviceId`}
                    render={({ field: { onChange, value } }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <CustomSelect
                            defaultValue={value}
                            placeholder="Select service"
                            options={services
                              .filter(({ active }) => active)
                              .map(({ id, name }) => ({
                                value: id,
                                label: name.toUpperCase(),
                              }))}
                            value={value}
                            onChange={(val) => {
                              onChange(val)
                              const selectedService = services.find(
                                (service) => service.id === val,
                              )
                              if (selectedService) {
                                form.setValue(
                                  `items.${index}.rate`,
                                  selectedService.rate,
                                )
                              } else {
                                form.setValue(`items.${index}.rate`, 0)
                              }
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>
                <td className="py-2 px-2 w-[15%]">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Qty"
                            {...field}
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
                <td className="py-2 px-2 w-[15%]">
                  <FormField
                    control={form.control}
                    name={`items.${index}.rate`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter rate"
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
                <td className="text-center w-[15%]">
                  <FormField
                    control={form.control}
                    name={`items.${index}.discount`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter discount if any..."
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
                <td className="py-2 px-2 w-[15%]">
                  <Input
                    type="text"
                    className="text-right"
                    value={amount.toFixed(2)}
                    readOnly
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
            )
          })}
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
                  onClick={() => append(initialItems)}
                >
                  Add lines
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => form.setValue('items', [])}
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
