import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ErrorNotification } from '@/components/custom/error-component'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { searchValidateSchema } from '@/lib/schema-rules'
import { expenseQueryOptions } from '@/features/transactions/services/query-options'
import { useDocumentTitle } from '@/hooks/use-title'
import PageHeader from '@/components/custom/page-header'
import Search from '@/components/custom/search'
import { ExpenseDatatable } from '@/features/transactions/components/expenses/expense-datatable'

export const Route = createFileRoute('/_authenticated/expenses/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context, deps: { q } }) =>
    await context.queryClient.ensureQueryData(expenseQueryOptions.all(q)),
  component: ExpensesRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function ExpensesRouteComponent() {
  useDocumentTitle('Expenses')
  const { q } = Route.useSearch()
  const {
    data: { data: expenses },
  } = useSuspenseQuery(expenseQueryOptions.all(q))
  const navigate = useNavigate({ from: Route.fullPath })
  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Manage your all your expenses."
        path="/expenses/new"
      />
      <Search
        defaultValue={q}
        placeholder="Search by expense no, amount,payee,project,account or description"
        parentClassName="w-full md:w-1/2"
        onHandleSearch={(value) =>
          navigate({
            search: (prev) => ({
              ...prev,
              q: value.trim().length > 0 ? value : undefined,
            }),
          })
        }
      />
      <ExpenseDatatable expenses={expenses} />
    </div>
  )
}
