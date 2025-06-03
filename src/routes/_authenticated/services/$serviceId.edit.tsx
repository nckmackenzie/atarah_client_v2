import { createFileRoute } from '@tanstack/react-router'
import { ErrorNotification } from '@/components/custom/error-component'
import { FormLoader } from '@/components/custom/loaders'
import { accountsQueryOptions } from '@/features/transactions/services/query-options'
import { serviceQueryOptions } from '@/features/admin/services/query-options'
import FormHeader from '@/components/custom/form-header'
import { ServiceForm } from '@/features/admin/components/services/service-form'
import { transformOptions } from '@/lib/formatters'
import { useDocumentTitle } from '@/hooks/use-title'

export const Route = createFileRoute(
  '/_authenticated/services/$serviceId/edit',
)({
  loader: async ({ context, params: { serviceId } }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(
        serviceQueryOptions.service(serviceId),
      ),
      context.queryClient.ensureQueryData(accountsQueryOptions.all()),
    ]),
  component: EditServiceRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function EditServiceRouteComponent() {
  useDocumentTitle('Edit Service')
  const [service, accounts] = Route.useLoaderData()
  return (
    <div className="space-y-10">
      <FormHeader
        title="Edit service"
        description="Update the service details below"
      />
      <ServiceForm
        accounts={transformOptions(
          accounts.data.filter((acc) => acc.parentId !== null),
        )}
        service={service.data}
      />
    </div>
  )
}
