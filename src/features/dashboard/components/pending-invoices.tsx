import { useSuspenseQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import type { Invoice } from '@/features/transactions/utils/transactions.types'
import { dashboardQueryOptions } from '@/features/dashboard/services/query-options'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat, numberFormat } from '@/lib/formatters'
import { DataTable } from '@/components/custom/datatable'

export function PendingInvoices() {
  const {
    data: { data: invoices },
  } = useSuspenseQuery(dashboardQueryOptions.pendingInvoices())
  const columns: Array<ColumnDef<Invoice>> = [
    {
      accessorKey: 'invoiceNo',
      header: 'Invoice Number',
    },
    {
      accessorKey: 'client.name',
      header: 'Client',
      cell: ({ row }) => row.original.client.name.toUpperCase(),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => `Ksh ${numberFormat(row.original.totalAmount)}`,
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => dateFormat(row.original.dueDate, 'long'),
    },
  ]
  return (
    <Card className="shadow-none col-span-2">
      <CardHeader>
        <CardTitle>Pending Invoices</CardTitle>
        <CardDescription>
          You have {invoices.length} pending invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={invoices} />
      </CardContent>
    </Card>
  )
}

export function PendingInvoicesFallback() {
  return (
    <Card className="shadow-none animate-pulse md:col-span-2">
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
              <TableHead>Invoice Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(4)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
