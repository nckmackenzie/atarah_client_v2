import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { InvoicePayment } from '@/features/transactions/utils/transactions.types'
import { DataTable } from '@/components/custom/datatable'
import { DataTableColumnHeader } from '@/components/custom/datatable-column-header'
import { dateFormat, numberFormat } from '@/lib/formatters'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CustomDropdownContent from '@/components/custom/custom-dropdown-content'
import { EditAction } from '@/components/custom/custom-button'
import { AdminGuard } from '@/components/custom/admin-guard'
import { DeletePrompt } from '@/components/custom/delete-prompt'
import { Badge } from '@/components/ui/badge'

interface InvoicesPaymentsDatatableProps {
  payments: Array<InvoicePayment>
}

function InvoicesPaymentsDatatable({
  payments,
}: InvoicesPaymentsDatatableProps) {
  const columns: Array<ColumnDef<InvoicePayment>> = [
    {
      accessorKey: 'client',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => <div>{row.original.clientName.toUpperCase()}</div>,
    },
    {
      accessorKey: 'invoiceNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice #" />
      ),
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Date" />
      ),
      cell: ({
        row: {
          original: { paymentDate },
        },
      }) => <div>{dateFormat(paymentDate, 'long')}</div>,
    },
    {
      accessorKey: 'paymentReference',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Reference" />
      ),
      cell: ({
        row: {
          original: { paymentReference },
        },
      }) => <div>{paymentReference.toUpperCase()}</div>,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({
        row: {
          original: { amount },
        },
      }) => <Badge variant="secondary">Ksh {numberFormat(amount)}</Badge>,
    },

    {
      id: 'actions',
      cell: ({
        row: {
          original: { id },
        },
      }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="more-btn">
              <MoreVertical className="icon-muted" />
            </button>
          </DropdownMenuTrigger>
          {/* TODO: HANDLE DELETE AND UPDATE */}
          <CustomDropdownContent>
            <DropdownMenuItem asChild>
              <Link
                to="/invoices/payments/$paymentId/edit"
                params={{ paymentId: id }}
              >
                <EditAction />
              </Link>
            </DropdownMenuItem>

            <AdminGuard>
              <DeletePrompt
                action={async () => {}}
                description="Are you sure you want to delete this invoice payment?"
                toastMessage="Payment deleted successfully!"
                invalidateKey={['invoice payments']}
              />
            </AdminGuard>
          </CustomDropdownContent>
        </DropdownMenu>
      ),
    },
  ]
  return <DataTable data={payments} columns={columns} />
}

export { InvoicesPaymentsDatatable }
