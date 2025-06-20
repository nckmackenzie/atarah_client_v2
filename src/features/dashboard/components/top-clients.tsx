import { useSuspenseQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import type { ColumnDef } from '@tanstack/react-table'
import type { TopClient } from '@/features/dashboard/utils/dashboard.types'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { dashboardQueryOptions } from '@/features/dashboard/services/query-options'
import { numberFormat } from '@/lib/formatters'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { DataTable } from '@/components/custom/datatable'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function TopClients() {
  const {
    data: { data: clients },
  } = useSuspenseQuery(dashboardQueryOptions.topClients())

  const columns: Array<ColumnDef<TopClient>> = [
    {
      accessorKey: 'name',
      header: 'Client Name',
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'invoices',
      header: 'Invoices',
      cell: ({ row }) => row.original.invoices,
    },
    {
      accessorKey: 'revenue',
      header: 'Total Revenue',
      cell: ({ row }) => (
        <Badge variant="success">
          Ksh {numberFormat(row.original.revenue)}
        </Badge>
      ),
    },
  ]

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Top Clients</CardTitle>
        <CardDescription>
          Top 5 based on the total amount invoiced
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={clients}
          withPaginationButtons={false}
        />
      </CardContent>
    </Card>
  )
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-success)',
  },
  expenses: {
    label: 'Expenses',
    color: 'var(--chart-error)',
  },
} satisfies ChartConfig

export function RevenueExpenseChart() {
  const {
    data: { data },
  } = useSuspenseQuery(dashboardQueryOptions.revenueVsExpenses())
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>
          Monthly comparison of revenue and expenses (6 Months)
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="expenses"
              stackId="a"
              fill="var(--color-expenses)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="revenue"
              stackId="a"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function RevenueVsExpensesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-60" />
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="w-full h-60">
          <Skeleton className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TopClientsFallback() {
  return (
    <Card className="shadow-none ">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-60" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead>Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-64" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
