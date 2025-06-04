import { createFileRoute } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/use-title'
import { accountsQueryOptions } from '@/features/transactions/services/query-options'
import FormHeader from '@/components/custom/form-header'
import { AccountsForm } from '@/features/transactions/components/accounts/accounts-form'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/chart-of-accounts/new')({
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(accountsQueryOptions.min()),
  component: NewAccountRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function NewAccountRouteComponent() {
  useDocumentTitle('New Account')
  const { data } = Route.useLoaderData()
  return (
    <div className="space-y-8">
      <FormHeader
        title="Add New Account"
        description="Fill in the required details."
      />
      <AccountsForm accounts={data} />
    </div>
  )
}
