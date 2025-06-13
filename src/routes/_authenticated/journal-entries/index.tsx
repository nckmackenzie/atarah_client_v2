import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UseNavigateResult } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/use-title'
import {
  optionalStringSchemaEntry,
  requiredStringSchemaEntry,
} from '@/lib/schema-rules'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  JournalForm,
  JournalFormSkeleton,
} from '@/features/transactions/components/journal-entries/journal-form'
import {
  accountsQueryOptions,
  journalQueryOptions,
} from '@/features/transactions/services/query-options'
import { transformOptions } from '@/lib/formatters'
import { ErrorNotification } from '@/components/custom/error-component'
import { CustomAlert } from '@/components/custom/custom-alert'

export const Route = createFileRoute('/_authenticated/journal-entries/')({
  validateSearch: z.object({ journalNo: optionalStringSchemaEntry() }),
  loaderDeps: ({ search: { journalNo } }) => ({ journalNo }),
  loader: async ({ context, deps: { journalNo } }) =>
    Promise.all([
      context.queryClient.ensureQueryData(accountsQueryOptions.min()),
      context.queryClient.fetchQuery(journalQueryOptions.journalNo()),
      journalNo
        ? context.queryClient.ensureQueryData(
            journalQueryOptions.journal(journalNo),
          )
        : Promise.resolve(null),
    ]),
  component: JournalEntryRouteComponent,
  pendingComponent: () => <JournalFormSkeleton />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function JournalEntryRouteComponent() {
  useDocumentTitle('Journal Entries')
  const navigate = useNavigate({ from: Route.fullPath })
  const { journalNo: jnParam } = Route.useSearch()
  const [accounts, jNo, journal] = Route.useLoaderData()

  const { isLoading, data, error } = useQuery({
    ...journalQueryOptions.journal(jnParam ?? ''),
    enabled: !!jnParam,
  })

  const journalNo = data?.data.journalNo || jNo.data || 1
  return (
    <div className="space-y-6">
      {error && <CustomAlert variant="error" description={error.message} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Journal Entry #{journalNo}
        </h1>
        <SearchForm navigate={navigate} isLoading={isLoading} />
      </div>
      {!isLoading ? (
        <JournalForm
          navigate={navigate}
          accounts={transformOptions(accounts.data)}
          journalNo={journalNo}
          journal={(data?.data || journal?.data) ?? undefined}
          transactionId={data?.data.transactionId}
          key={journalNo}
        />
      ) : (
        <JournalFormSkeleton />
      )}
    </div>
  )
}

function SearchForm({
  navigate,
  isLoading,
}: {
  navigate: UseNavigateResult<'/journal-entries'>
  isLoading: boolean
}) {
  const form = useForm<{ journalNo: string }>({
    resolver: zodResolver(
      z.object({
        journalNo: requiredStringSchemaEntry('Enter journal No').regex(
          /^\d+$/,
          'Journal number must be numeric',
        ),
      }),
    ),
    defaultValues: {
      journalNo: '',
    },
    mode: 'onSubmit',
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      form.reset()
      navigate({ search: {} }) // Clear search
    }
  }

  return (
    <Form {...form}>
      <form
        className="w-full sm:w-1/3"
        onSubmit={form.handleSubmit((data) => {
          navigate({ search: { journalNo: data.journalNo.toString() } })
          form.reset()
        })}
      >
        <FormField
          control={form.control}
          name="journalNo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="search"
                  placeholder="Search by journal no..."
                  {...field}
                  onBlur={() => form.clearErrors()}
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
