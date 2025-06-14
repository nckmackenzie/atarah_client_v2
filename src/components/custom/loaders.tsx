import classes from './loaders.module.css'
import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton } from '@/components/custom/table-skeleton'

export function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center mt-72 space-y-1">
      <div className={classes['flipping-8']} />
      <p className="text-muted-foreground text-sm animate-pulse">
        Fetching data...
      </p>
    </div>
  )
}

export function AuthedPageLoader() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-0.5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <Skeleton className="h-10 w-72" />
      <TableSkeleton
        rowCount={10}
        columnWidths={['w-36', 'w-24', 'w-56', 'w-44', 'w-24', 'w-1']}
      />
    </div>
  )
}

export function FormLoader() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function ReportLoader() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>

      <TableSkeleton
        rowCount={10}
        columnWidths={['w-36', 'w-24', 'w-56', 'w-44', 'w-24', 'w-32']}
      />
    </div>
  )
}
