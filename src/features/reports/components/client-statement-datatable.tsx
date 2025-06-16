import { useSearch } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import type { ClientStatement } from '@/features/reports/utils/report.types'
import { dateFormat, numberFormat, titleCase } from '@/lib/formatters'
import { ReportDataTable } from '@/components/custom/report-datatable'
import { TableCell } from '@/components/ui/table'

interface ClientStatementDatatableProps {
  statement: Array<ClientStatement>
  selectedClient: string
}

function ClientStatementDatatable({
  statement,
  selectedClient,
}: ClientStatementDatatableProps) {
  const { from, to } = useSearch({
    from: '/_authenticated/reports/client-statement',
  })

  const totals = statement.reduce(
    (acc, item) => {
      acc.debit += parseFloat(item.debit)
      acc.credit += parseFloat(item.credit)
      return acc
    },
    { debit: 0, credit: 0 },
  )

  const columns: Array<ColumnDef<ClientStatement>> = [
    {
      accessorKey: 'paymentDate',
      header: () => <div>Payment Date</div>,
      cell: ({
        row: {
          original: { date },
        },
      }) => <div>{dateFormat(date, 'reporting')}</div>,
    },
    {
      accessorKey: 'reference',
      header: () => <div>Reference</div>,
      cell: ({
        row: {
          original: { reference },
        },
      }) => <div>{reference.toUpperCase()}</div>,
    },
    {
      accessorKey: 'debit',
      header: () => <div className="text-right">Debit</div>,
      cell: ({
        row: {
          original: { debit },
        },
      }) => <div className="text-right">{numberFormat(debit)}</div>,
    },
    {
      accessorKey: 'credit',
      header: () => <div className="text-right">Credit</div>,
      cell: ({
        row: {
          original: { credit },
        },
      }) => <div className="text-right">{numberFormat(credit)}</div>,
    },
    {
      accessorKey: 'balance',
      header: () => <div className="text-right">Balance</div>,
      cell: ({
        row: {
          original: { balance },
        },
      }) => <div className="text-right">{numberFormat(balance)}</div>,
    },
  ]

  if (statement.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No data found</div>
    )
  }

  return (
    <ReportDataTable
      columns={columns}
      data={statement}
      reportTitle="Client Statement"
      reportDescription={`Client Statement for ${titleCase(selectedClient)} from ${dateFormat(
        from as string,
        'reporting',
      )} to ${dateFormat(to as string, 'reporting')}`}
      orientation="portrait"
      customFooter={
        <>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">
            {numberFormat(totals.debit)}
          </TableCell>
          <TableCell className="text-right">
            {numberFormat(totals.credit)}
          </TableCell>
          <TableCell className="text-right">
            {numberFormat(
              parseFloat(totals.debit.toString()) -
                parseFloat(totals.credit.toString()),
            )}
          </TableCell>
        </>
      }
    />
  )
}

export { ClientStatementDatatable }
