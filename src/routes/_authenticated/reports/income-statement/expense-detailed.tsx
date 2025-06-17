import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import type { IncomeStatementExpenseDetail } from '@/features/reports/utils/report.types'
import { requiredStringSchemaEntry } from '@/lib/schema-rules'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { reportQueryOptions } from '@/features/reports/services/query-options'
import { Button } from '@/components/ui/button'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { ReportDataTable } from '@/components/custom/report-datatable'
import { TableCell } from '@/components/ui/table'

export const Route = createFileRoute(
  '/_authenticated/reports/income-statement/expense-detailed',
)({
  validateSearch: z.object({
    from: z.string().date('Start date must be a valid date'),
    to: z.string().date('End date must be a valid date'),
    parentAccount: requiredStringSchemaEntry('Account is required'),
  }),
  loaderDeps: ({ search: { from, parentAccount, to } }) => ({
    from,
    parentAccount,
    to,
  }),
  loader: async ({ context, deps: { parentAccount, to, from } }) =>
    await context.queryClient.ensureQueryData(
      reportQueryOptions.incomeStatementExpenseDetail({
        parentAccount,
        from,
        to,
      }),
    ),
  component: IncomeStatementExpenseDetailedRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function IncomeStatementExpenseDetailedRouteComponent() {
  const { parentAccount, from, to } = Route.useSearch()
  const {
    data: { data: expenses, totals },
  } = useSuspenseQuery(
    reportQueryOptions.incomeStatementExpenseDetail({
      parentAccount,
      from,
      to,
    }),
  )
  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/reports/income-statement" search={{ from, to }}>
          &larr; Go Back
        </Link>
      </Button>
      <IncomeDetailedTable
        data={expenses}
        totals={totals}
        parentAccount={parentAccount}
        from={from}
        to={to}
      />
    </div>
  )
}

function IncomeDetailedTable({
  data,
  totals,
  parentAccount,
  from,
  to,
}: {
  data: Array<IncomeStatementExpenseDetail>
  totals: string
  parentAccount: string
  from: string
  to: string
}) {
  const columns: Array<ColumnDef<IncomeStatementExpenseDetail>> = [
    {
      accessorKey: 'transactionDate',
      header: () => <div>Date</div>,
      cell: ({
        row: {
          original: { transactionDate },
        },
      }) => <div>{dateFormat(transactionDate, 'reporting')}</div>,
    },
    {
      accessorKey: 'account',
      header: () => <div>Account</div>,
      cell: ({
        row: {
          original: { account },
        },
      }) => <div>{account}</div>,
    },
    {
      accessorKey: 'reference',
      header: () => <div>Reference</div>,
      cell: ({
        row: {
          original: { reference },
        },
      }) => <div>{reference?.toString() || ''}</div>,
    },
    {
      accessorKey: 'description',
      header: () => <div>Description</div>,
      cell: ({
        row: {
          original: { description },
        },
      }) => <div>{description?.toString() || ''}</div>,
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
  return (
    <ReportDataTable
      data={data}
      columns={columns}
      reportTitle="Income Statement - Expense Detailed"
      reportDescription={`Expense detailed report for ${parentAccount} from ${dateFormat(
        from,
        'reporting',
      )} to ${dateFormat(to, 'reporting')}`}
      customFooter={
        <>
          <TableCell colSpan={4}>Totals</TableCell>
          <TableCell className="text-right">{numberFormat(totals)}</TableCell>
        </>
      }
    />
  )
}
