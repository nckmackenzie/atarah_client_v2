import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import type { IncomeStatementIncomeDetail } from '@/features/reports/utils/report.types'
import { requiredStringSchemaEntry } from '@/lib/schema-rules'
import { useDocumentTitle } from '@/hooks/use-title'
import { Button } from '@/components/ui/button'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { reportQueryOptions } from '@/features/reports/services/query-options'
import { ReportDataTable } from '@/components/custom/report-datatable'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { TableCell } from '@/components/ui/table'

export const Route = createFileRoute(
  '/_authenticated/reports/income-statement/revenue-detailed',
)({
  validateSearch: z.object({
    from: z.string().date('Start date must be a valid date'),
    to: z.string().date('End date must be a valid date'),
    serviceId: requiredStringSchemaEntry('Service ID is required'),
  }),
  loaderDeps: ({ search: { from, serviceId, to } }) => ({
    from,
    serviceId,
    to,
  }),
  loader: async ({ context, deps: { serviceId, to, from } }) =>
    await context.queryClient.ensureQueryData(
      reportQueryOptions.incomeStatementIncomeDetail({ serviceId, from, to }),
    ),
  component: IncomeDetailedRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function IncomeDetailedRouteComponent() {
  useDocumentTitle('Income Statement - Revenue Detailed')
  const { from, to, serviceId } = Route.useSearch()
  const {
    data: { data: incomes, totals },
  } = useSuspenseQuery(
    reportQueryOptions.incomeStatementIncomeDetail({ serviceId, from, to }),
  )
  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/reports/income-statement" search={{ from, to }}>
          &larr; Go Back
        </Link>
      </Button>
      <IncomeDetailedTable data={incomes} totals={totals} />
    </div>
  )
}

function IncomeDetailedTable({
  data,
  totals,
}: {
  data: Array<IncomeStatementIncomeDetail>
  totals: string
}) {
  const columns: Array<ColumnDef<IncomeStatementIncomeDetail>> = [
    {
      accessorKey: 'invoiceNo',
      header: () => <div>Invoice No</div>,
    },
    {
      accessorKey: 'invoiceDate',
      header: () => <div>Payment Date</div>,
      cell: ({
        row: {
          original: { invoiceDate },
        },
      }) => <div>{dateFormat(invoiceDate, 'reporting')}</div>,
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
      accessorKey: 'rate',
      header: () => <div>Rate</div>,
      cell: ({
        row: {
          original: { rate },
        },
      }) => <div className="text-right">{numberFormat(rate)}</div>,
    },
    {
      accessorKey: 'quantity',
      header: () => <div>Quantity</div>,
      cell: ({
        row: {
          original: { quantity },
        },
      }) => <div className="text-right">{numberFormat(quantity)}</div>,
    },
    {
      accessorKey: 'discount',
      header: () => <div>Discount</div>,
      cell: ({
        row: {
          original: { discount },
        },
      }) => <div className="text-right">{numberFormat(discount)}</div>,
    },
    {
      accessorKey: 'total',
      header: () => <div>Total</div>,
      cell: ({
        row: {
          original: { total },
        },
      }) => <div className="text-right">{numberFormat(total)}</div>,
    },
  ]
  return (
    <ReportDataTable
      data={data}
      columns={columns}
      reportTitle="Income Statement - Revenue Detailed"
      reportDescription="This report shows the detailed revenue generated from services rendered"
      customFooter={
        <>
          <TableCell colSpan={6}>Totals</TableCell>
          <TableCell>{numberFormat(totals)}</TableCell>
        </>
      }
    />
  )
}
