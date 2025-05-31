import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import UserForm from '@/features/admin/components/users/user-form'
import { useDocumentTitle } from '@/hooks/use-title'
import { CustomAlert } from '@/components/custom/custom-alert'
import {
  roleQueryOptions,
  userQueryOptions,
} from '@/features/admin/services/query-options'
import { transformOptions } from '@/lib/formatters'

export const Route = createFileRoute('/_authenticated/users/$userId/edit')({
  loader: async ({ context, params: { userId } }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(userQueryOptions.user(userId)),
      context.queryClient.ensureQueryData(roleQueryOptions.all()),
    ]),
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <CustomAlert variant="error" description={error.message} />
  ),
})

function RouteComponent() {
  useDocumentTitle('Edit user')
  const { userId } = Route.useParams()
  const [_, roles] = Route.useLoaderData()
  const {
    data: { data: user },
  } = useSuspenseQuery(userQueryOptions.user(userId))
  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold">Edit User</h1>
          <p className="text-muted-foreground text-sm">
            Fill out the form below to edit user.
          </p>
        </div>
      </header>
      <UserForm
        loaderRoles={transformOptions(roles.data.filter((r) => r.isActive))}
        user={user}
      />
    </div>
  )
}
