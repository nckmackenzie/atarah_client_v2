import { createFileRoute } from '@tanstack/react-router'
import { ErrorNotification } from '@/components/custom/error-component'
import { FormLoader } from '@/components/custom/loaders'
import { accountsQueryOptions } from '@/features/transactions/services/query-options'
import FormHeader from '@/components/custom/form-header'
import { titleCase } from '@/lib/formatters'
import { AccountsForm } from '@/features/transactions/components/accounts/accounts-form'
import { useDocumentTitle } from '@/hooks/use-title'

export const Route = createFileRoute(
  '/_authenticated/chart-of-accounts/$accountId/edit',
)({
  loader: async ({ context, params: { accountId } }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(
        accountsQueryOptions.account(accountId),
      ),
      context.queryClient.ensureQueryData(accountsQueryOptions.min()),
    ]),
  component: EditAccountRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function EditAccountRouteComponent() {
  const [account, accounts] = Route.useLoaderData()
  useDocumentTitle(`Edit ${titleCase(account.data.name)} Account`)
  return (
    <div className="space-y-8">
      <FormHeader
        title={`Edit ${titleCase(account.data.name)} details`}
        description="Update the account details below."
      />
      <AccountsForm account={account.data} accounts={accounts.data} />
    </div>
  )
}
