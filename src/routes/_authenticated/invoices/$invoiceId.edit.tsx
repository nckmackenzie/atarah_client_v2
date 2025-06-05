import { createFileRoute } from '@tanstack/react-router'
import { ErrorNotification } from '@/components/custom/error-component'
import { FormLoader } from '@/components/custom/loaders'
import {
  clientQueryOptions,
  serviceQueryOptions,
} from '@/features/admin/services/query-options'
import { invoiceQueryOptions } from '@/features/transactions/services/query-options'
import FormHeader from '@/components/custom/form-header'
import { useDocumentTitle } from '@/hooks/use-title'
import { InvoiceForm } from '@/features/transactions/components/invoices/invoice-form'
import { transformOptions } from '@/lib/formatters'

export const Route = createFileRoute(
  '/_authenticated/invoices/$invoiceId/edit',
)({
  loader: async ({ context, params: { invoiceId } }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(serviceQueryOptions.all()),
      context.queryClient.ensureQueryData(clientQueryOptions.all()),
      context.queryClient.ensureQueryData(
        invoiceQueryOptions.invoice(invoiceId),
      ),
    ]),
  component: EditInvoiceRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function EditInvoiceRouteComponent() {
  const [services, clients, invoice] = Route.useLoaderData()
  useDocumentTitle(`Edit Invoice - ${invoice.data.invoiceNo}`)
  return (
    <div className="space-y-8">
      <FormHeader
        title="Edit Invoice"
        description="Modify the details of the invoice."
      />
      <InvoiceForm
        clients={transformOptions(clients.data.filter(({ active }) => active))}
        services={services.data}
        invoice={invoice.data}
      />
    </div>
  )
}
