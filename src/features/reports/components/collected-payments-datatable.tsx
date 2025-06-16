import type { ColumnDef } from '@tanstack/react-table'
import type { CollectedPayment } from '@/features/reports/utils/report.types'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { ReportDataTable } from '@/components/custom/report-datatable'
import { TableCell } from '@/components/ui/table'

interface CollectedPaymentsDatatableProps {
  payments: Array<CollectedPayment>
  total: string
}

function CollectedPaymentsDatatable({
  payments,
  total,
}: CollectedPaymentsDatatableProps) {
  const columns: Array<ColumnDef<CollectedPayment>> = [
    {
      accessorKey: 'paymentDate',
      header: () => <div>Payment Date</div>,
      cell: ({
        row: {
          original: { paymentDate },
        },
      }) => <div>{dateFormat(paymentDate, 'reporting')}</div>,
    },
    {
      accessorKey: 'clientName',
      header: () => <div>Client</div>,
      cell: ({
        row: {
          original: { clientName },
        },
      }) => <div>{clientName.toUpperCase()}</div>,
    },
    {
      accessorKey: 'invoiceNo',
      header: () => <div>Invoice No</div>,
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

  if (payments.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No data found</div>
    )
  }

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <ReportDataTable
        columns={columns}
        data={payments}
        reportTitle="Payment Collection Report"
        reportDescription="This report shows the collected payments for the selected date range."
        orientation="landscape"
        excelData={payments.map(
          ({
            paymentDate,
            clientName,
            invoiceNo,
            paymentMethod,
            paymentReference,
            amount,
          }) => ({
            'Payment Date': dateFormat(paymentDate, 'reporting'),
            'Client Name': clientName.toUpperCase(),
            'Invoice No': `|${invoiceNo}`,
            'Payment Method': paymentMethod,
            'Payment Reference': paymentReference,
            Amount: amount,
          }),
        )}
        customFooter={
          <>
            <TableCell className="font=semibold text-lg" colSpan={5}>
              Total:
            </TableCell>
            <TableCell className="font=semibold text-right">
              {numberFormat(total)}
            </TableCell>
          </>
        }
      />
    </div>
  )
}

export { CollectedPaymentsDatatable }
