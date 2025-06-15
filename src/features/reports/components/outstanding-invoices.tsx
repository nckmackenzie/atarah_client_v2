import type { ColumnDef } from '@tanstack/react-table'
import type { InvoiceStatus } from '@/features/reports/utils/report.types'
import { dateFormat } from '@/lib/formatters'
import { ReportDataTable } from '@/components/custom/report-datatable'
import { TableCell } from '@/components/ui/table'

interface InvoicesByStatusDatatableProps {
  invoices: Array<Omit<InvoiceStatus, 'status'>>
  totals: {
    totalAmount: string
    totalPaid: string
    totalBalance: string
  }
}

function OutstandingInvoicesDatatable({
  invoices,
  totals,
}: InvoicesByStatusDatatableProps) {
  const columns: Array<ColumnDef<Omit<InvoiceStatus, 'status'>>> = [
    {
      accessorKey: 'invoiceNo',
      header: () => <div>Invoice No</div>,
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
      accessorKey: 'invoiceDate',
      header: () => <div>Invoice Date</div>,
      cell: ({
        row: {
          original: { invoiceDate },
        },
      }) => <div>{dateFormat(invoiceDate, 'reporting')}</div>,
    },
    {
      accessorKey: 'dueDate',
      header: () => <div>Due Date</div>,
      cell: ({
        row: {
          original: { dueDate },
        },
      }) => <div>{dateFormat(dueDate, 'reporting')}</div>,
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="text-right">Invoice Amount</div>,
      cell: ({
        row: {
          original: { totalAmount },
        },
      }) => <div className="text-right">{totalAmount}</div>,
    },
    {
      accessorKey: 'totalPaid',
      header: () => <div className="text-right">Amount Paid</div>,
      cell: ({
        row: {
          original: { totalPaid },
        },
      }) => <div className="text-right">{totalPaid}</div>,
    },
    {
      accessorKey: 'balance',
      header: () => <div className="text-right">Balance</div>,
      cell: ({
        row: {
          original: { balance },
        },
      }) => <div className="text-right">{balance}</div>,
    },
  ]

  if (invoices.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No data found</div>
    )
  }

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <ReportDataTable
        columns={columns}
        data={invoices}
        reportTitle="Outstanding Invoices Report"
        reportDescription="This report shows the outstanding invoices."
        orientation="landscape"
        excelData={invoices.map(
          ({
            balance,
            clientName,
            dueDate,
            invoiceDate,
            invoiceNo,
            totalAmount,
            totalPaid,
          }) => ({
            'Invoice No': `|${invoiceNo}`,
            'Client Name': clientName.toUpperCase(),
            'Invoice Date': dateFormat(invoiceDate, 'reporting'),
            'Due Date': dateFormat(dueDate, 'reporting'),
            'Invoice Amount': totalAmount,
            'Amount Paid': totalPaid,
            Balance: balance,
          }),
        )}
        customFooter={
          <>
            <TableCell className="font=semibold text-lg" colSpan={4}>
              Total:
            </TableCell>
            <TableCell className="font=semibold text-right">
              {totals.totalAmount}
            </TableCell>
            <TableCell className="font=semibold text-right">
              {totals.totalPaid}
            </TableCell>
            <TableCell className="font=semibold text-right">
              {totals.totalBalance}
            </TableCell>
          </>
        }
      />
    </div>
  )
}

export { OutstandingInvoicesDatatable }
