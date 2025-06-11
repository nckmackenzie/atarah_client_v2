import { createFileRoute } from '@tanstack/react-router'
import {
  accountsQueryOptions,
  expenseQueryOptions,
} from '@/features/transactions/services/query-options'
import { projectQueryOptions } from '@/features/admin/services/query-options'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { useDocumentTitle } from '@/hooks/use-title'
import { ExpenseForm } from '@/features/transactions/components/expenses/expenses-form'
import { transformOptions } from '@/lib/formatters'

export const Route = createFileRoute(
  '/_authenticated/expenses/$expenseId/edit',
)({
  loader: async ({ context, params: { expenseId } }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(projectQueryOptions.all()),
      context.queryClient.ensureQueryData(accountsQueryOptions.min()),
      context.queryClient.ensureQueryData(
        expenseQueryOptions.expense(expenseId),
      ),
    ]),
  component: EditExpenseRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function EditExpenseRouteComponent() {
  useDocumentTitle('Edit Expense')
  const [projects, accounts, expense] = Route.useLoaderData()
  return (
    <div className="space-y-6">
      <ExpenseForm
        expenseNo={expense.data.expenseNo}
        accounts={transformOptions(
          accounts.data.filter(({ accountTypeId }) => +accountTypeId === 2),
        )}
        projects={transformOptions(
          projects.data.filter(({ active }) => active),
        )}
        expense={expense.data}
      />
    </div>
  )
}
