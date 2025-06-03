import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import PageHeader from '@/components/custom/page-header'
import { useDocumentTitle } from '@/hooks/use-title'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { serviceQueryOptions } from '@/features/admin/services/query-options'
import { accountsQueryOptions } from '@/features/transactions/services/query-options'
import Search from '@/components/custom/search'
import { searchValidateSchema } from '@/lib/schema-rules'
import { ServicesDatatable } from '@/features/admin/components/services/services-datatable'

export const Route = createFileRoute('/_authenticated/services/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(serviceQueryOptions.all()),
      context.queryClient.ensureQueryData(accountsQueryOptions.all()),
    ]),
  component: ServicesComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function ServicesComponent() {
  useDocumentTitle('Services')
  const { q } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const {
    data: { data: services },
  } = useSuspenseQuery(serviceQueryOptions.all(q))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage services from here"
        path="/services/new"
      />
      <Search
        defaultValue={q}
        placeholder="Search by role name"
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
      <ServicesDatatable services={services} />
    </div>
  )
}
