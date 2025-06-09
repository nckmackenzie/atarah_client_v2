import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CopyIcon,
  CreditCardIcon,
  MoreVertical,
  PrinterIcon,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type {
  Invoice,
  InvoicePaymentFormValues,
} from '@/features/transactions/utils/transactions.types'
import { DataTable } from '@/components/custom/datatable'
import { DataTableColumnHeader } from '@/components/custom/datatable-column-header'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { CustomStatusBadge } from '@/components/custom/status-badges'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CustomDropdownContent from '@/components/custom/custom-dropdown-content'
import { EditAction } from '@/components/custom/custom-button'
import { AdminGuard } from '@/components/custom/admin-guard'
import { DeletePrompt } from '@/components/custom/delete-prompt'
import {
  createPayment,
  deleteInvoice,
} from '@/features/transactions/services/api'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { invoicePaymentFormSchema } from '@/features/transactions/utils/schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import CustomSelect from '@/components/custom/custom-select'
import { PAYMENT_METHOD } from '@/lib/utils'
import { useError } from '@/hooks/use-error'
import { CustomAlert } from '@/components/custom/custom-alert'
import { formErrorHandler } from '@/lib/error-handlers'

interface InvoicesDatatableProps {
  invoices: Array<Invoice>
}

export function InvoicesDatatable({ invoices }: InvoicesDatatableProps) {
  const [open, setOpen] = useState(false)
  const [invoiceDetails, setInvoiceDetails] = useState<Invoice | null>(null)
  const columns: Array<ColumnDef<Invoice>> = [
    {
      accessorKey: 'client',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => <div>{row.original.client.name.toUpperCase()}</div>,
    },
    {
      accessorKey: 'invoiceNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice #" />
      ),
    },
    {
      accessorKey: 'invoiceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice Date" />
      ),
      cell: ({
        row: {
          original: { invoiceDate },
        },
      }) => <div>{dateFormat(invoiceDate, 'long')}</div>,
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({
        row: {
          original: { dueDate },
        },
      }) => <div>{dateFormat(dueDate, 'long')}</div>,
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({
        row: {
          original: { totalAmount },
        },
      }) => <div>{numberFormat(totalAmount)}</div>,
    },
    {
      id: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({
        row: {
          original: { amountPaid, dueDate, totalAmount },
        },
      }) => {
        const paidAmount = amountPaid ?? 0
        const isActive = +paidAmount < +totalAmount
        const invoiceStatus = !isActive
          ? 'settled'
          : new Date(dueDate) < new Date()
            ? 'overdue'
            : 'pending'
        return (
          <CustomStatusBadge
            variant={
              invoiceStatus === 'settled'
                ? 'success'
                : invoiceStatus === 'overdue'
                  ? 'error'
                  : 'warning'
            }
            text={
              invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1)
            }
          />
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id, amountPaid, totalAmount } = row.original
        const paidAmount = amountPaid ?? 0
        const isActive = +paidAmount < +totalAmount
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="more-btn">
                <MoreVertical className="icon-muted" />
              </button>
            </DropdownMenuTrigger>
            <CustomDropdownContent>
              {!amountPaid && (
                <DropdownMenuItem asChild>
                  <Link
                    to="/invoices/$invoiceId/edit"
                    params={{ invoiceId: id }}
                  >
                    <EditAction />
                  </Link>
                </DropdownMenuItem>
              )}
              {isActive && (
                <DropdownMenuItem
                  onClick={() => {
                    setInvoiceDetails(row.original)
                    setOpen(true)
                  }}
                >
                  <CreditCardIcon className="size-4" />
                  <span>Make Payment</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/invoices/new" search={{ cloneFrom: id }}>
                  <CopyIcon className="size-4" />
                  <span>Duplicate</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/invoices/$invoiceId/print"
                  params={{ invoiceId: id }}
                >
                  <PrinterIcon className="size-4" />
                  <span>Print</span>
                </Link>
              </DropdownMenuItem>
              {!amountPaid && (
                <AdminGuard>
                  <DeletePrompt
                    action={() => deleteInvoice(id)}
                    description="Are you sure you want to delete this invoice?"
                    toastMessage="Invoice deleted successfully!"
                    invalidateKey={['invoices']}
                  />
                </AdminGuard>
              )}
            </CustomDropdownContent>
          </DropdownMenu>
        )
      },
    },
  ]
  return (
    <>
      <DataTable data={invoices} columns={columns} />
      {invoiceDetails && (
        <InvoivePayment
          open={open}
          onSetOpen={setOpen}
          invoiceDetails={invoiceDetails}
        />
      )}
    </>
  )
}

interface InvoivePaymentProps {
  open: boolean
  onSetOpen: (open: boolean) => void
  invoiceDetails: Invoice
}

function InvoivePayment({
  open,
  onSetOpen,
  invoiceDetails,
}: InvoivePaymentProps) {
  const form = useForm<InvoicePaymentFormValues>({
    defaultValues: {
      invoiceId: invoiceDetails.id,
      paymentDate: new Date(),
      paymentMethod: 'cheque',
      amount: 0,
    },
    resolver: zodResolver(invoicePaymentFormSchema),
  })

  const { clearErrors, errors, onError } = useError()
  const queryClient = useQueryClient()
  const { isPending, mutate } = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: InvoicePaymentFormValues
    }) => createPayment(id, values),
    onError: (err) => formErrorHandler(err, form.setError, onError),
    onSuccess: () => {
      form.reset()
      onSetOpen(false)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  function onSubmit(data: InvoicePaymentFormValues) {
    clearErrors()
    mutate({ id: invoiceDetails.id, values: data })
  }

  return (
    <Dialog open={open} onOpenChange={onSetOpen}>
      <DialogContent className="sm:max-w-[640px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Make Invoice Payment</DialogTitle>
              <DialogDescription>
                Fill in the details below to make a payment for the invoice.
              </DialogDescription>
            </DialogHeader>

            {errors && <CustomAlert variant="error" description={errors} />}

            <div className="space-y-4">
              <div className="grid grid-cols-2 items-start gap-4">
                <div className="grid gap-2">
                  <Label>Client Name</Label>
                  <div className="input capitalize">
                    {invoiceDetails.client.name}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Invoice No</Label>
                  <div className="input capitalize">
                    {invoiceDetails.invoiceNo}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 items-start gap-4">
                <div className="grid gap-2">
                  <Label>Invoice Amount</Label>
                  <div className="input capitalize">
                    {numberFormat(invoiceDetails.totalAmount)}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Amount Paid</Label>
                  <div className="input capitalize">
                    {numberFormat(invoiceDetails.amountPaid ?? 0)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 items-start gap-4">
                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={dateFormat(field.value)}
                          onChange={(e) => {
                            field.onChange(new Date(e.target.value))
                          }}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter payment amount"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0)
                          }}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 items-start gap-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <CustomSelect
                          defaultValue={field.value}
                          {...field}
                          options={PAYMENT_METHOD}
                          disabled={isPending}
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
                    <FormItem>
                      <FormLabel>Payment Reference</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter payment reference"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
