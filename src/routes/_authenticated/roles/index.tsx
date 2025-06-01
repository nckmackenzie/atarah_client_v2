import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import PageHeader from '@/components/custom/page-header'
import { useDocumentTitle } from '@/hooks/use-title'
import { roleQueryOptions } from '@/features/admin/services/query-options'
import { searchValidateSchema } from '@/lib/schema-rules'
import { AuthedPageLoader } from '@/components/custom/loaders'
import Search from '@/components/custom/search'
import { Rolesdatatable } from '@/features/admin/components/roles/roles-datatable'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/roles/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context, deps: { q } }) =>
    await context.queryClient.ensureQueryData(roleQueryOptions.all(q)),
  component: RolesRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function RolesRouteComponent() {
  useDocumentTitle('Roles')
  const { q } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    data: { data: roles },
  } = useSuspenseQuery(roleQueryOptions.all(q))
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage your roles here."
        buttonText="Create Role"
        path="/roles/new"
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
      <Rolesdatatable roles={roles} />
    </div>
  )
}
