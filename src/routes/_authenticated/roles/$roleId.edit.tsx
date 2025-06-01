import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { CustomAlert } from '@/components/custom/custom-alert'
import { FormLoader } from '@/components/custom/loaders'
import { roleQueryOptions } from '@/features/admin/services/query-options'
import { RolesForm } from '@/features/admin/components/roles/roles-form'
import { useDocumentTitle } from '@/hooks/use-title'

export const Route = createFileRoute('/_authenticated/roles/$roleId/edit')({
  loader: async ({ context, params: { roleId } }) =>
    await context.queryClient.ensureQueryData(roleQueryOptions.role(roleId)),
  component: RouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => (
    <CustomAlert variant="error" description={error.message} />
  ),
})

function RouteComponent() {
  useDocumentTitle('Edit Role')
  const { data } = useQuery(roleQueryOptions.role(Route.useParams().roleId))
  console.log(data?.data)
  return (
    <div>
      <RolesForm role={data?.data} />
    </div>
  )
}
