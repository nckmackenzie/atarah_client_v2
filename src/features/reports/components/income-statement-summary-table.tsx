import { Link } from '@tanstack/react-router'
import type { IncomeStatement } from '@/features/reports/utils/report.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import { numberFormat } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface IncomeStatementSummaryTableProps {
  from: string
  to: string
  statement: IncomeStatement
  totals: {
    totalIncome: string
    totalExpense: string
  }
}

function IncomeStatementSummaryTable({
  from,
  to,
  statement,
  totals,
}: IncomeStatementSummaryTableProps) {
  const profitLoss =
    parseFloat(totals.totalIncome) - parseFloat(totals.totalExpense)
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Income Statement Summary</h2>
      <p className="mb-4 text-muted-foreground">
        This table summarizes the total income and expenses for the selected
        period.
      </p>
      <Table className="border rounded-md">
        <TableBody>
          <TableRow>
            <TableHead
              colSpan={2}
              className="text-lg bg-success text-success-foreground"
            >
              Revenue
            </TableHead>
          </TableRow>
          {statement.incomes.map((income) => (
            <TableRow key={income.serviceId}>
              <TableCell className="px-4 py-2 border-b">
                {income.serviceName}
              </TableCell>
              <TableCell className="px-4 py-2 border-b text-right">
                <Link
                  to="/reports/income-statement/revenue-detailed"
                  search={{ from, to, serviceId: income.serviceId }}
                  className="text-link font-medium hover:underline"
                >
                  {numberFormat(income.total)}
                </Link>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="px-4 py-2 text-success-foreground font-bold">
              Total Income
            </TableCell>
            <TableCell className="px-4 py-2 text-success-foreground font-bold text-right">
              {numberFormat(totals.totalIncome)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead
              colSpan={2}
              className="text-lg bg-error text-error-foreground"
            >
              Expenses
            </TableHead>
          </TableRow>
          {statement.expenses.map((expense) => (
            <TableRow key={expense.accountName}>
              <TableCell className="px-4 py-2  border-b">
                {expense.accountName.toUpperCase()}
              </TableCell>
              <TableCell className="px-4 py-2  border-b text-right">
                <Link
                  to="/reports/income-statement/expense-detailed"
                  search={{
                    from,
                    to,
                    parentAccount: expense.accountName.toLowerCase(),
                  }}
                  className="text-link font-medium hover:underline"
                >
                  {numberFormat(expense.total)}
                </Link>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="px-4 text-error-foreground font-bold">
              Total Expenses
            </TableCell>
            <TableCell className="px-4 text-error-foreground font-bold text-right">
              {numberFormat(totals.totalExpense)}
            </TableCell>
          </TableRow>
          <TableRow
            className={cn('', {
              'text-error-foreground': profitLoss < 0,
              'text-success-foreground': profitLoss >= 0,
            })}
          >
            <TableCell className={cn('px-4 py-2 font-bold')}>
              Profit/Loss
            </TableCell>
            <TableCell className={cn('px-4 py-2 font-bold text-right')}>
              {numberFormat(profitLoss)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export { IncomeStatementSummaryTable }
