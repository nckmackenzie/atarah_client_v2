import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ErrorBoundary } from 'react-error-boundary'
import {
  DollarSignIcon,
  HourglassIcon,
  TrendingUpIcon,
  Wallet2Icon,
} from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useDocumentTitle } from '@/hooks/use-title'
import {
  StatCard,
  StatCardSkeleton,
} from '@/features/dashboard/components/stat-card'

import { dashboardQueryOptions } from '@/features/dashboard/services/query-options'
import { compactNumberFormatter } from '@/lib/formatters'
import {
  PendingInvoices,
  PendingInvoicesFallback,
} from '@/features/dashboard/components/pending-invoices'
import {
  ErrorFallback,
  ErrorNotification,
} from '@/components/custom/error-component'
import {
  RevenueExpenseChart,
  RevenueVsExpensesSkeleton,
  TopClients,
  TopClientsFallback,
} from '@/features/dashboard/components/top-clients'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(dashboardQueryOptions.stats()),
  component: RouteComponent,
  pendingComponent: () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueVsExpensesSkeleton />
        </div>
        <div className="col-span-3">
          <TopClientsFallback />
        </div>
      </div>
      <PendingInvoicesFallback />
    </div>
  ),
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function RouteComponent() {
  useDocumentTitle('Dashboard')
  const {
    data: { data: stats },
  } = useSuspenseQuery(dashboardQueryOptions.stats())
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          Icon={DollarSignIcon}
          value={`Ksh ${compactNumberFormatter(stats.totalRevenue)}`}
          className="bg-success border-success"
        />
        <StatCard
          title="Total Expenses"
          Icon={Wallet2Icon}
          value={`Ksh ${compactNumberFormatter(stats.totalExpenses)}`}
          className="bg-error border-error"
        />
        <StatCard
          title="Pending Invoices"
          Icon={HourglassIcon}
          value={`Ksh ${compactNumberFormatter(stats.pendingInvoices)}`}
          className="bg-warning border-warning"
        />
        <StatCard
          title="Net Profit"
          Icon={TrendingUpIcon}
          value={`Ksh ${compactNumberFormatter(stats.netProfit)}`}
          className="bg-success border-success"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
        <div className="col-span-4">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<RevenueVsExpensesSkeleton />}>
              <RevenueExpenseChart />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="col-span-3">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<TopClientsFallback />}>
              <TopClients />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
      <div className="flex flex-col gap-y-8">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<PendingInvoicesFallback />}>
            <PendingInvoices />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
