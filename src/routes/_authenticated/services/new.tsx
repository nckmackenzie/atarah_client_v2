import { createFileRoute } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/use-title'
import { accountsQueryOptions } from '@/features/transactions/services/query-options'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { ServiceForm } from '@/features/admin/components/services/service-form'
import { transformOptions } from '@/lib/formatters'
import FormHeader from '@/components/custom/form-header'

export const Route = createFileRoute('/_authenticated/services/new')({
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(accountsQueryOptions.all()),

  component: NewServiceComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function NewServiceComponent() {
  useDocumentTitle('New Service')
  const { data } = Route.useLoaderData()
  return (
    <div className="space-y-10">
      <FormHeader
        title="Create new service"
        description="Fill in all the required details"
      />
      <ServiceForm
        accounts={transformOptions(data.filter((acc) => acc.parentId !== null))}
      />
    </div>
  )
}
