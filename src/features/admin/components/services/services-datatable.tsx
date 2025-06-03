import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Service } from '@/features/admin/utils/admin.types'
import { DataTable } from '@/components/custom/datatable'
import { DataTableColumnHeader } from '@/components/custom/datatable-column-header'
import { numberFormat } from '@/lib/formatters'
import { CustomStatusBadge } from '@/components/custom/status-badges'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CustomDropdownContent from '@/components/custom/custom-dropdown-content'
import { AdminGuard } from '@/components/custom/admin-guard'
import { DeletePrompt } from '@/components/custom/delete-prompt'
import { EditAction } from '@/components/custom/custom-button'
import { deleteService } from '@/features/admin/services/api'

interface ServicesDatatableProps {
  services: Array<Service>
}

function ServicesDatatable({ services }: ServicesDatatableProps) {
  const columns: Array<ColumnDef<Service>> = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Service Name" />
      ),
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Service Rate" />
      ),
      cell: ({
        row: {
          original: { rate },
        },
      }) => <div>{numberFormat(rate)}</div>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
    },
    {
      accessorKey: 'account.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GL Account" />
      ),
      cell: ({
        row: {
          original: {
            account: { name },
          },
        },
      }) => <div>{name}</div>,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({
        row: {
          original: { active },
        },
      }) => (
        <CustomStatusBadge
          variant={active ? 'success' : 'error'}
          text={active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      id: 'actions',
      cell: ({
        row: {
          original: { id },
        },
      }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="more-btn">
              <MoreVertical className="icon-muted" />
            </button>
          </DropdownMenuTrigger>
          <CustomDropdownContent>
            <DropdownMenuItem asChild>
              <Link to="/services/$serviceId/edit" params={{ serviceId: id }}>
                <EditAction />
              </Link>
            </DropdownMenuItem>
            <AdminGuard>
              <DeletePrompt
                action={async () => {
                  await deleteService(id)
                }}
                description="Are you sure you want to delete this service?"
                toastMessage="Service deleted successfully!"
                invalidateKey={['services']}
              />
            </AdminGuard>
          </CustomDropdownContent>
        </DropdownMenu>
      ),
    },
  ]
  return <DataTable data={services} columns={columns} />
}

export { ServicesDatatable }
