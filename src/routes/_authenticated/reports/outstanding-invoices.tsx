import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDocumentTitle } from '@/hooks/use-title'
import { AuthedPageLoader, ReportLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { clientQueryOptions } from '@/features/admin/services/query-options'
import {
  optionalStringSchemaEntry,
  requiredStringSchemaEntry,
} from '@/lib/schema-rules'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import CustomSelect from '@/components/custom/custom-select'
import { Button } from '@/components/ui/button'
import { transformOptions } from '@/lib/formatters'
import { reportQueryOptions } from '@/features/reports/services/query-options'
import { CustomAlert } from '@/components/custom/custom-alert'
import { OutstandingInvoicesDatatable } from '@/features/reports/components/outstanding-invoices'

export const Route = createFileRoute(
  '/_authenticated/reports/outstanding-invoices',
)({
  validateSearch: z.object({ clientId: optionalStringSchemaEntry() }),
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(clientQueryOptions.all()),
  component: OutstandingRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function OutstandingRouteComponent() {
  useDocumentTitle('Outstanding Invoices Report')
  const { clientId } = Route.useSearch()
  const { data, isLoading, error } = useQuery({
    ...reportQueryOptions.outstandingInvoices(clientId),
    enabled: !!clientId,
  })

  return (
    <div className="space-y-6">
      {error && <CustomAlert variant="error" description={error.message} />}
      <ReportParams clientId={clientId} />
      {isLoading && <ReportLoader />}
      {!isLoading && data?.data && (
        <OutstandingInvoicesDatatable
          invoices={data.data}
          totals={data.totals}
        />
      )}
    </div>
  )
}

function ReportParams({ clientId }: { clientId?: string }) {
  const { data: clients } = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })
  const form = useForm<{ clientId: string }>({
    defaultValues: {
      clientId: clientId || 'all',
    },
    resolver: zodResolver(
      z.object({ clientId: requiredStringSchemaEntry('client is required') }),
    ),
  })

  function onSubmit(data: { clientId: string }) {
    navigate({ search: { ...data } })
  }
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value}
                    options={[
                      { value: 'all', label: 'All' },
                      ...transformOptions(clients),
                    ]}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Preview</Button>
      </form>
    </Form>
  )
}
