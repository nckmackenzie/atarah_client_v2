import type { ColumnDef } from '@tanstack/react-table'
import type { ExpenseReport } from '@/features/reports/utils/report.types'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { ReportDataTable } from '@/components/custom/report-datatable'
import { TableCell } from '@/components/ui/table'

interface ExpenseReportDatatableProps {
  expenses: Array<ExpenseReport>
  total: string
}

function ExpenseReportDatatable({ expenses }: ExpenseReportDatatableProps) {
  const columns: Array<ColumnDef<ExpenseReport>> = [
    {
      accessorKey: 'expenseNo',
      header: () => <div>Expense No</div>,
    },
    {
      accessorKey: 'expenseDate',
      header: () => <div>Payment Date</div>,
      cell: ({
        row: {
          original: { expenseDate },
        },
      }) => <div>{dateFormat(expenseDate, 'reporting')}</div>,
    },
    {
      accessorKey: 'payee',
      header: () => <div>Payee</div>,
      cell: ({
        row: {
          original: { payee },
        },
      }) => <div>{payee.toUpperCase()}</div>,
    },
    {
      accessorKey: 'accountName',
      header: () => <div>Account</div>,
    },
    {
      accessorKey: 'projectName',
      header: () => <div>Project</div>,
    },
    {
      accessorKey: 'paymentMethod',
      header: () => <div>Payment Method</div>,
    },
    {
      accessorKey: 'paymentReference',
      header: () => <div>Payment Reference</div>,
    },
    {
      accessorKey: 'amount',
      header: () => <div>Amount</div>,
      cell: ({
        row: {
          original: { amount },
        },
      }) => <div className="text-right">{numberFormat(amount)}</div>,
    },
  ]

  if (expenses.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No data found</div>
    )
  }
  return (
    <ReportDataTable
      columns={columns}
      data={expenses}
      reportDescription="Detailed overview of all expenses incurred during the specified period."
      reportTitle="Expense Report"
      customFooter={
        <>
          <TableCell className="text-semibold" colSpan={7}>
            Total
          </TableCell>
          <TableCell className="text-right text-semibold">
            {numberFormat(
              expenses.reduce(
                (acc, expense) => acc + parseFloat(expense.amount),
                0,
              ),
            )}
          </TableCell>
        </>
      }
    />
  )
}

export { ExpenseReportDatatable }
