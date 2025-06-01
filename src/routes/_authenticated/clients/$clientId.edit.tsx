import { createFileRoute } from '@tanstack/react-router'
import { FormLoader } from '@/components/custom/loaders'
import { clientQueryOptions } from '@/features/admin/services/query-options'
import { useDocumentTitle } from '@/hooks/use-title'
import ClientForm from '@/features/admin/components/clients/client-form'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/clients/$clientId/edit')({
  loader: async ({ params: { clientId }, context }) =>
    await context.queryClient.ensureQueryData(
      clientQueryOptions.client(clientId),
    ),
  component: EditClientRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function EditClientRouteComponent() {
  const { data } = Route.useLoaderData()
  useDocumentTitle(`Edit ${data.name} details`)
  return <ClientForm client={data} />
}
