import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ErrorNotification } from '@/components/custom/error-component'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { useDocumentTitle } from '@/hooks/use-title'
import { invoicePaymentQueryOptions } from '@/features/transactions/services/query-options'
import { searchValidateSchema } from '@/lib/schema-rules'
import PageHeader from '@/components/custom/page-header'
import Search from '@/components/custom/search'
import { InvoicesPaymentsDatatable } from '@/features/transactions/components/invoices/invoices-payments-datatable'

export const Route = createFileRoute('/_authenticated/invoices/payments/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context, deps: { q } }) =>
    await context.queryClient.ensureQueryData(
      invoicePaymentQueryOptions.all(q),
    ),
  component: InvoicePaymentsRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function InvoicePaymentsRouteComponent() {
  useDocumentTitle('Invoice Payments')
  const { q } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    data: { data: payments },
  } = useSuspenseQuery(invoicePaymentQueryOptions.all(q))
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Payments"
        description="Manage all your invoice payments."
        path="/invoices/payments/new"
      />
      <Search
        defaultValue={q}
        placeholder="Search by invoice no, amount or customer name,payment reference"
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
      <InvoicesPaymentsDatatable payments={payments} />
    </div>
  )
}
