import { createFileRoute } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/use-title'
import { projectQueryOptions } from '@/features/admin/services/query-options'
import {
  accountsQueryOptions,
  expenseQueryOptions,
} from '@/features/transactions/services/query-options'
import { ExpenseForm } from '@/features/transactions/components/expenses/expenses-form'
import { transformOptions } from '@/lib/formatters'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/expenses/new')({
  loader: async ({ context }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(projectQueryOptions.all()),
      context.queryClient.ensureQueryData(accountsQueryOptions.min()),
      context.queryClient.ensureQueryData(expenseQueryOptions.expenseNo()),
    ]),
  component: AddExpenseRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function AddExpenseRouteComponent() {
  useDocumentTitle('Add Expense')
  const [projects, accounts, expenseNo] = Route.useLoaderData()
  return (
    <div className="space-y-6">
      <ExpenseForm
        expenseNo={expenseNo.data}
        accounts={transformOptions(
          accounts.data.filter(({ accountTypeId }) => +accountTypeId === 2),
        )}
        projects={transformOptions(
          projects.data.filter(({ active }) => active),
        )}
      />
    </div>
  )
}
