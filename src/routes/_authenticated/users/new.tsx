import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import UserForm from '@/features/admin/components/users/user-form'
import { FormLoader } from '@/components/custom/loaders'
import { useDocumentTitle } from '@/hooks/use-title'
import { CustomAlert } from '@/components/custom/custom-alert'
import { roleQueryOptions } from '@/features/admin/services/query-options'
import { transformOptions } from '@/lib/formatters'

export const Route = createFileRoute('/_authenticated/users/new')({
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(roleQueryOptions.all()),
  component: RouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => (
    <CustomAlert variant="error" description={error.message} />
  ),
})

function RouteComponent() {
  useDocumentTitle('Create User')
  const {
    data: { data: roles },
  } = useSuspenseQuery(roleQueryOptions.all())
  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold">Create User</h1>
          <p className="text-muted-foreground text-sm">
            Fill out the form below to create a new user.
          </p>
        </div>
      </header>
      <UserForm
        loaderRoles={transformOptions(roles.filter((r) => r.isActive))}
      />
    </div>
  )
}
