import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useDocumentTitle } from '@/hooks/use-title'
import {
  reportWithClientAndDateRangeSchema,
  validateReportWithClientAndDateRange,
} from '@/lib/schema-rules'
import { clientQueryOptions } from '@/features/admin/services/query-options'

import { AuthedPageLoader, ReportLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { InvoicesByStatusDatatable } from '@/features/reports/components/invoices-by-status-datatable'
import { ReportParamsWithClientAndDateRange } from '@/features/reports/components/report-params-with-client-daterange'
import { CustomAlert } from '@/components/custom/custom-alert'
import { transformOptions } from '@/lib/formatters'
import { reportQueryOptions } from '@/features/reports/services/query-options'

export const Route = createFileRoute('/_authenticated/reports/invoice-status')({
  validateSearch: reportWithClientAndDateRangeSchema,
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(clientQueryOptions.all()),
  component: InvoiceStatusRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function InvoiceStatusRouteComponent() {
  useDocumentTitle('Invoice Status Report')
  const { data: clients } = Route.useLoaderData()
  const { clientId, from, to } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const allIsValid = validateReportWithClientAndDateRange(clientId, from, to)

  const { data, isLoading, error } = useQuery({
    ...reportQueryOptions.invoiceStatus({
      clientId: clientId!,
      from: from!,
      to: to!,
    }),
    enabled: allIsValid,
  })

  return (
    <div className="space-y-6">
      {error && <CustomAlert variant="error" description={error.message} />}
      <ReportParamsWithClientAndDateRange
        clients={transformOptions(clients)}
        clientId={clientId}
        from={from}
        to={to}
        navigate={navigate}
      />

      {isLoading && <ReportLoader />}

      {!isLoading && data?.data && (
        <InvoicesByStatusDatatable invoices={data.data} />
      )}
    </div>
  )
}
