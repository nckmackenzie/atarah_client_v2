import type { ColumnDef } from '@tanstack/react-table'
import type { InvoiceStatus } from '@/features/reports/utils/report.types'
import { CustomStatusBadge } from '@/components/custom/status-badges'
import { dateFormat } from '@/lib/formatters'
import { ReportDataTable } from '@/components/custom/report-datatable'
import { TableCell } from '@/components/ui/table'

interface InvoicesByStatusDatatableProps {
  invoices: Array<InvoiceStatus>
  totals: {
    totalAmount: string
    totalPaid: string
    totalBalance: string
  }
}

function InvoicesByStatusDatatable({
  invoices,
  totals,
}: InvoicesByStatusDatatableProps) {
  const columns: Array<ColumnDef<InvoiceStatus>> = [
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
      accessorKey: 'status',
      header: () => <div>Status</div>,
      cell: ({
        row: {
          original: { status },
        },
      }) => (
        <CustomStatusBadge
          variant={
            status === 'Paid'
              ? 'success'
              : status === 'Overdue'
                ? 'error'
                : 'warning'
          }
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
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
        reportTitle="Invoice Status Report"
        reportDescription="This report shows the status of invoices based on their payment status."
        orientation="landscape"
        excelData={invoices.map(
          ({
            balance,
            clientName,
            dueDate,
            invoiceDate,
            invoiceNo,
            status,
            totalAmount,
            totalPaid,
          }) => ({
            'Invoice No': `|${invoiceNo}`,
            'Client Name': clientName.toUpperCase(),
            'Invoice Date': dateFormat(invoiceDate, 'reporting'),
            'Due Date': dateFormat(dueDate, 'reporting'),
            Status: status.charAt(0).toUpperCase() + status.slice(1),
            'Invoice Amount': totalAmount,
            'Amount Paid': totalPaid,
            Balance: balance,
          }),
        )}
        customFooter={
          <>
            <TableCell className="font=semibold text-lg" colSpan={5}>
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

export { InvoicesByStatusDatatable }
