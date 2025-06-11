import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Expense } from '@/features/transactions/utils/transactions.types'
import { DataTable } from '@/components/custom/datatable'
import { DataTableColumnHeader } from '@/components/custom/datatable-column-header'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CustomDropdownContent from '@/components/custom/custom-dropdown-content'
import { EditAction } from '@/components/custom/custom-button'
import { AdminGuard } from '@/components/custom/admin-guard'
import { DeletePrompt } from '@/components/custom/delete-prompt'
import { deleteExpense } from '@/features/transactions/services/api'

interface ExpenseDatatableProps {
  expenses: Array<Expense>
}

function ExpenseDatatable({ expenses }: ExpenseDatatableProps) {
  const columns: Array<ColumnDef<Expense>> = [
    {
      accessorKey: 'expenseDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice Date" />
      ),
      cell: ({
        row: {
          original: { expenseDate },
        },
      }) => <div>{dateFormat(expenseDate, 'long')}</div>,
    },
    {
      accessorKey: 'payee',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payee" />
      ),
      cell: ({ row }) => <div>{row.original.payee.toUpperCase()}</div>,
    },
    {
      accessorKey: 'expenseNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expense #" />
      ),
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
      }) => <div>{paymentReference?.toUpperCase()}</div>,
    },
    {
      id: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({
        row: {
          original: { expenseTotal },
        },
      }) => <Badge variant="error">Ksh {numberFormat(expenseTotal)}</Badge>,
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
          <CustomDropdownContent>
            <DropdownMenuItem asChild>
              <Link to="/expenses/$expenseId/edit" params={{ expenseId: id }}>
                <EditAction />
              </Link>
            </DropdownMenuItem>

            <AdminGuard>
              <DeletePrompt
                action={() => deleteExpense(id)}
                description="Are you sure you want to delete this expense?"
                toastMessage="Expense deleted successfully!"
                invalidateKey={['expenses']}
              />
            </AdminGuard>
          </CustomDropdownContent>
        </DropdownMenu>
      ),
    },
  ]
  return <DataTable data={expenses} columns={columns} />
}

export { ExpenseDatatable }
