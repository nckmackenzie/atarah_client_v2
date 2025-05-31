import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { ErrorComponent } from '@/components/custom/error-component'
import { userQueryOptions } from '@/features/admin/services/query-options'
import { UsersDatatable } from '@/features/admin/components/users/users-datatable'
import { useDocumentTitle } from '@/hooks/use-title'
import { searchValidateSchema } from '@/lib/schema-rules'
import Search from '@/components/custom/search'

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context, deps: { q } }) =>
    await context.queryClient.ensureQueryData(userQueryOptions.all(q)),
  component: UsersComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorComponent message={error.message} />,
})

function UsersComponent() {
  useDocumentTitle('Users')
  const { q } = Route.useSearch()
  const {
    data: { data: users },
  } = useSuspenseQuery(userQueryOptions.all(q))

  const navigate = useNavigate({ from: Route.fullPath })
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage your users here.
          </p>
        </div>
        <Button size="lg" asChild className="w-full sm:w-auto">
          <Link to="/users/new" className="flex items-center gap-x-2">
            <Plus />
            <span>Create User</span>
          </Link>
        </Button>
      </header>
      <Search
        parentClassName="w-full md:w-1/2 lg:w-1/3"
        defaultValue={q}
        placeholder="Search by name,contact or email"
        onHandleSearch={(value: string) =>
          navigate({
            search: (prev) => ({
              ...prev,
              q: value.trim().length > 0 ? `${value.toString()}` : undefined,
            }),
          })
        }
      />
      <UsersDatatable users={users} />
    </div>
  )
}
