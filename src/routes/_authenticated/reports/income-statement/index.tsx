import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useDocumentTitle } from '@/hooks/use-title'
import {
  reportDateRangeSchema,
  reportDateRangeSchemaWithRequired,
} from '@/lib/schema-rules'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { dateFormat } from '@/lib/formatters'
import { AuthedPageLoader, ReportLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { reportQueryOptions } from '@/features/reports/services/query-options'
import { CustomAlert } from '@/components/custom/custom-alert'
import { IncomeStatementSummaryTable } from '@/features/reports/components/income-statement-summary-table'

export const Route = createFileRoute(
  '/_authenticated/reports/income-statement/',
)({
  validateSearch: reportDateRangeSchema,
  component: IncomeStatementRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function IncomeStatementRouteComponent() {
  useDocumentTitle('Income Statement')
  const searchParams = Route.useSearch()

  const allIsValid =
    reportDateRangeSchemaWithRequired.safeParse(searchParams).success

  const { data, isLoading, error } = useQuery({
    ...reportQueryOptions.incomeStatement({
      from: searchParams.from!,
      to: searchParams.to!,
    }),
    enabled: allIsValid,
  })

  return (
    <div className="space-y-6">
      {error && <CustomAlert variant="error" description={error.message} />}
      <ReportParameters from={searchParams.from} to={searchParams.to} />
      {isLoading && <ReportLoader />}

      {!isLoading && data?.data && (
        <IncomeStatementSummaryTable
          from={searchParams.from as string}
          to={searchParams.to as string}
          statement={data.data}
          totals={{
            totalExpense: data.totals.totalExpense,
            totalIncome: data.totals.totalIncome,
          }}
        />
      )}
    </div>
  )
}

function ReportParameters({ from, to }: { from?: string; to?: string }) {
  const navigate = useNavigate({ from: Route.fullPath })
  const form = useForm<z.infer<typeof reportDateRangeSchemaWithRequired>>({
    defaultValues: {
      from: from || '',
      to: to || '',
    },
    resolver: zodResolver(reportDateRangeSchemaWithRequired),
  })
  const onSubmit = (
    data: z.infer<typeof reportDateRangeSchemaWithRequired>,
  ) => {
    navigate({ search: { from: data.from, to: data.to } })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    onChange={field.onChange}
                    value={field.value ? dateFormat(field.value) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    onChange={field.onChange}
                    value={field.value ? dateFormat(field.value) : ''}
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
