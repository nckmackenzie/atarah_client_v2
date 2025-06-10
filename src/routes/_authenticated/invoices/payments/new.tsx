import { createFileRoute } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/use-title'
import { clientQueryOptions } from '@/features/admin/services/query-options'
import { InvoicePaymentForm } from '@/features/transactions/components/invoices/invoices-payment-form'
import { transformOptions } from '@/lib/formatters'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/invoices/payments/new')({
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(clientQueryOptions.all()),
  component: NewPaymentRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function NewPaymentRouteComponent() {
  useDocumentTitle('New Invoice Payment')
  const { data: clients } = Route.useLoaderData()
  return (
    <InvoicePaymentForm
      clients={transformOptions(clients.filter(({ active }) => active))}
    />
  )
}
