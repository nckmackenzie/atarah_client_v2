import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Option } from '@/types/index.types'
import { useDocumentTitle } from '@/hooks/use-title'
import { AuthedPageLoader, ReportLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { accountsQueryOptions } from '@/features/transactions/services/query-options'
import { projectQueryOptions } from '@/features/admin/services/query-options'
import {
  optionalStringSchemaEntry,
  reportDateRangeSchema,
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
import { Input } from '@/components/ui/input'
import { dateFormat, transformOptions } from '@/lib/formatters'
import CustomSelect from '@/components/custom/custom-select'
import { Button } from '@/components/ui/button'

import { CustomAlert } from '@/components/custom/custom-alert'
import { reportQueryOptions } from '@/features/reports/services/query-options'
import { ExpenseReportDatatable } from '@/features/reports/components/expense-report-datatable'

const expenseReportParamsSchema = z
  .object({
    from: z.string().date(),
    to: z.string().date(),
    glAccountId: requiredStringSchemaEntry('GL Account is required'),
    projectId: requiredStringSchemaEntry('Project is required'),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to && new Date(data.from) > new Date(data.to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date cannot be after end date',
        path: ['from'],
      })
    }
  })
const allOption = { label: 'All', value: 'all' }

export const Route = createFileRoute('/_authenticated/reports/expenses-report')(
  {
    validateSearch: z.object({
      ...reportDateRangeSchema.shape,
      glAccountId: optionalStringSchemaEntry(),
      projectId: optionalStringSchemaEntry(),
    }),
    loader: async ({ context }) =>
      await Promise.all([
        context.queryClient.ensureQueryData(accountsQueryOptions.min()),
        context.queryClient.ensureQueryData(projectQueryOptions.all()),
      ]),
    component: ExpenseReportRouteComponent,
    pendingComponent: () => <AuthedPageLoader />,
    errorComponent: ({ error }) => (
      <ErrorNotification message={error.message} />
    ),
  },
)

function ExpenseReportRouteComponent() {
  useDocumentTitle('Expense Report')
  const [accounts, projects] = Route.useLoaderData()
  const searchParams = Route.useSearch()

  const isValid = expenseReportParamsSchema.safeParse({
    ...searchParams,
  }).success

  const { data, isLoading, error } = useQuery({
    ...reportQueryOptions.expenseReport({
      from: searchParams.from as string,
      to: searchParams.to as string,
      glAccountId: searchParams.glAccountId as string,
      projectId: searchParams.projectId as string,
    }),
    enabled: isValid,
  })

  return (
    <div className="space-y-6">
      {error && <CustomAlert variant="error" description={error.message} />}
      <ExpenseReportParams
        accounts={transformOptions(
          accounts.data.filter(({ accountTypeId }) => +accountTypeId === 2),
        )}
        projects={transformOptions(
          projects.data.filter(({ active }) => active),
        )}
      />
      {isLoading && <ReportLoader />}

      {!isLoading && data?.data && (
        <ExpenseReportDatatable expenses={data.data} total={data.total} />
      )}
    </div>
  )
}

interface ExpenseReportParamsProps {
  from?: string
  to?: string
  glAccountId?: string
  projectId?: string
  projects: Array<Option>
  accounts: Array<Option>
}

function ExpenseReportParams({
  accounts,
  projects,
  from,
  glAccountId,
  projectId,
  to,
}: ExpenseReportParamsProps) {
  const form = useForm<z.infer<typeof expenseReportParamsSchema>>({
    defaultValues: {
      from: from || '',
      to: to || '',
      glAccountId: glAccountId || 'all',
      projectId: projectId || 'all',
    },
    resolver: zodResolver(expenseReportParamsSchema),
  })
  const navigate = useNavigate({ from: Route.fullPath })

  function onSubmit(data: z.infer<typeof expenseReportParamsSchema>) {
    navigate({ search: (prev) => ({ ...prev, ...data }) })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start"
      >
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
        <FormField
          control={form.control}
          name="glAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <CustomSelect
                  defaultValue={field.value}
                  options={[allOption, ...accounts]}
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <FormControl>
                <CustomSelect
                  defaultValue={field.value}
                  options={[allOption, ...projects]}
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Preview</Button>
      </form>
    </Form>
  )
}
