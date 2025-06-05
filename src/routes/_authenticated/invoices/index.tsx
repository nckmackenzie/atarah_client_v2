import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/use-title'
import PageHeader from '@/components/custom/page-header'
import { searchValidateSchema } from '@/lib/schema-rules'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Search from '@/components/custom/search'
import { InvoicesDatatable } from '@/features/transactions/components/invoices/invoices-datatable'
import { invoiceQueryOptions } from '@/features/transactions/services/query-options'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'

const FILTER_OPTIONS = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Paid',
    value: 'paid',
  },
  {
    label: 'Overdue',
    value: 'overdue',
  },
] as const

const validateSearch = z.object({
  ...searchValidateSchema.shape,
  status: z.enum(['all', 'paid', 'pending', 'overdue']).optional(),
})

type FilterType = Exclude<z.infer<typeof validateSearch>['status'], undefined>

export const Route = createFileRoute('/_authenticated/invoices/')({
  validateSearch,
  loaderDeps: ({ search: { status, q } }) => ({ status, q }),
  loader: async ({ deps: { q, status }, context }) =>
    await context.queryClient.ensureQueryData(
      invoiceQueryOptions.all({ q, status }),
    ),
  component: InvoiceIndexRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function InvoiceIndexRouteComponent() {
  useDocumentTitle('Invoices')
  const { q, status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const {
    data: { data: invoices },
  } = useSuspenseQuery(invoiceQueryOptions.all({ q, status }))
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create, track, and manage all your billing invoices."
        path="/invoices/new"
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <Search
          defaultValue={q}
          placeholder="Search by invoice no, amount or customer name"
          parentClassName="w-full md:w-[420px]"
          onHandleSearch={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                q: value.trim().length > 0 ? value : undefined,
              }),
            })
          }
        />
        <FilterTabs />
      </div>
      <InvoicesDatatable invoices={invoices} />
    </div>
  )
}

function FilterTabs() {
  const { status } = Route.useSearch()
  const selectedTab = status || 'all'

  return (
    <>
      <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-sm bg-secondary">
        {FILTER_OPTIONS.map(({ label, value }) => (
          <FilterButton
            key={value}
            name={label}
            filter={value}
            isActive={selectedTab === value}
          />
        ))}
      </div>
    </>
  )
}

interface FilterButtonProps {
  name: string
  filter: FilterType
  isActive: boolean
}

function FilterButton({ name, filter, isActive }: FilterButtonProps) {
  const navigate = useNavigate({ from: Route.fullPath })
  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        'transition-colors hover:bg-background hover:text-foreground',
        {
          'bg-background text-foreground': isActive,
        },
      )}
      onClick={() =>
        navigate({ search: (prev) => ({ ...prev, status: filter }) })
      }
    >
      <span>{name}</span>
    </Button>
  )
}
