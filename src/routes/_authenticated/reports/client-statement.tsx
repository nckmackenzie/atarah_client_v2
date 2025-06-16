import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ErrorNotification } from '@/components/custom/error-component'
import { AuthedPageLoader, ReportLoader } from '@/components/custom/loaders'
import {
  reportWithClientAndDateRangeSchema,
  validateReportWithClientAndDateRange,
} from '@/lib/schema-rules'
import { clientQueryOptions } from '@/features/admin/services/query-options'
import { useDocumentTitle } from '@/hooks/use-title'
import { ReportParamsWithClientAndDateRange } from '@/features/reports/components/report-params-with-client-daterange'
import { CustomAlert } from '@/components/custom/custom-alert'
import { transformOptions } from '@/lib/formatters'
import { reportQueryOptions } from '@/features/reports/services/query-options'
import { ClientStatementDatatable } from '@/features/reports/components/client-statement-datatable'

export const Route = createFileRoute(
  '/_authenticated/reports/client-statement',
)({
  validateSearch: reportWithClientAndDateRangeSchema,
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(clientQueryOptions.all()),
  component: ClientStatementRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function ClientStatementRouteComponent() {
  useDocumentTitle('Client Statement')
  const { data: clients } = Route.useLoaderData()
  const { clientId, from, to } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const allIsValid = validateReportWithClientAndDateRange(clientId, from, to)
  const selectedClient =
    clients.find((client) => client.id === clientId)?.name || ''
  const { data, isLoading, error } = useQuery({
    ...reportQueryOptions.clientStatement({
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
        withAllClients={false}
      />

      {isLoading && <ReportLoader />}

      {!isLoading && data?.data && (
        <ClientStatementDatatable
          statement={data.data}
          selectedClient={selectedClient}
        />
      )}
    </div>
  )
}
