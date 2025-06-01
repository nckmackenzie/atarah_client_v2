import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useDocumentTitle } from '@/hooks/use-title'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { searchValidateSchema } from '@/lib/schema-rules'
import { clientQueryOptions } from '@/features/admin/services/query-options'
import PageHeader from '@/components/custom/page-header'
import Search from '@/components/custom/search'
import { ClientsDatatable } from '@/features/admin/components/clients/clients-datatable'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/clients/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context, deps: { q } }) =>
    await context.queryClient.ensureQueryData(clientQueryOptions.all(q)),
  component: ClientRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function ClientRouteComponent() {
  useDocumentTitle('Client Centre')
  const { q } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    data: { data: clients },
  } = useSuspenseQuery(clientQueryOptions.all(q))
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your clients here."
        buttonText="Create Client"
        path="/clients/new"
      />
      <Search
        defaultValue={q}
        placeholder="Search by client name,contact,email,pin or phone"
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
      <ClientsDatatable clients={clients} />
    </div>
  )
}
