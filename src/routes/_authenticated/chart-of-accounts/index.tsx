import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { accountsQueryOptions } from '@/features/transactions/services/query-options'
import { searchValidateSchema } from '@/lib/schema-rules'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { useDocumentTitle } from '@/hooks/use-title'
import PageHeader from '@/components/custom/page-header'
import Search from '@/components/custom/search'
import { AccountsDatatable } from '@/features/transactions/components/accounts/accounts-datatable'

export const Route = createFileRoute('/_authenticated/chart-of-accounts/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context, deps: { q } }) =>
    await context.queryClient.ensureQueryData(accountsQueryOptions.all(q)),
  component: ChartOfAccountsIndexRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function ChartOfAccountsIndexRouteComponent() {
  useDocumentTitle('Chart of Accounts')
  const { q } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    data: { data: accounts },
  } = useSuspenseQuery(accountsQueryOptions.all(q))
  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of accounts"
        description=""
        path="/chart-of-accounts/new"
      />
      <Search
        defaultValue={q}
        placeholder="Search by account..."
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
      <AccountsDatatable accounts={accounts} />
    </div>
  )
}
