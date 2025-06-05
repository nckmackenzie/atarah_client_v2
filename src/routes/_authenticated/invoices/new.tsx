import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { useDocumentTitle } from '@/hooks/use-title'
import FormHeader from '@/components/custom/form-header'
import { InvoiceForm } from '@/features/transactions/components/invoices/invoice-form'
import {
  clientQueryOptions,
  serviceQueryOptions,
} from '@/features/admin/services/query-options'
import { transformOptions } from '@/lib/formatters'
import { optionalStringSchemaEntry } from '@/lib/schema-rules'
import { invoiceQueryOptions } from '@/features/transactions/services/query-options'

export const Route = createFileRoute('/_authenticated/invoices/new')({
  validateSearch: z.object({ cloneFrom: optionalStringSchemaEntry() }),
  loaderDeps: ({ search: { cloneFrom } }) => ({ cloneFrom }),
  loader: async ({ context, deps: { cloneFrom } }) =>
    await Promise.all([
      context.queryClient.ensureQueryData(serviceQueryOptions.all()),
      context.queryClient.ensureQueryData(clientQueryOptions.all()),
      cloneFrom
        ? context.queryClient.ensureQueryData(
            invoiceQueryOptions.invoice(cloneFrom),
          )
        : Promise.resolve(null),
    ]),
  component: NewInvoiceRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function NewInvoiceRouteComponent() {
  useDocumentTitle('New Invoice')
  const [services, clients, invoice] = Route.useLoaderData()
  const { cloneFrom } = Route.useSearch()
  return (
    <div className="space-y-8">
      <FormHeader
        title="New Invoice"
        description="Create a new invoice for your clients."
      />
      <InvoiceForm
        clients={transformOptions(clients.data.filter(({ active }) => active))}
        services={services.data}
        cloned={!!cloneFrom}
        invoice={invoice?.data ?? undefined}
      />
    </div>
  )
}
