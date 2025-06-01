import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Client } from '@/features/admin/utils/admin.types'
import { DataTable } from '@/components/custom/datatable'
import { DataTableColumnHeader } from '@/components/custom/datatable-column-header'
import { CustomStatusBadge } from '@/components/custom/status-badges'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CustomDropdownContent from '@/components/custom/custom-dropdown-content'
import { EditAction } from '@/components/custom/custom-button'
import { AdminGuard } from '@/components/custom/admin-guard'
import { DeletePrompt } from '@/components/custom/delete-prompt'
import { deleteClient } from '@/features/admin/services/api'

interface ClientsDatatableProps {
  clients: Array<Client>
}

function ClientsDatatable({ clients }: ClientsDatatableProps) {
  const columns: Array<ColumnDef<Client>> = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client Name" />
      ),
    },
    {
      accessorKey: 'contact',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: 'taxPin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tax Pin" />
      ),
    },
    {
      accessorKey: 'active',
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
              <Link to="/clients/$clientId/edit" params={{ clientId: id }}>
                <EditAction />
              </Link>
            </DropdownMenuItem>
            <AdminGuard>
              <DeletePrompt
                description="This action cannot be undone. This will permanently delete the selected user."
                toastMessage="Client deleted successfully."
                invalidateKey={['clients']}
                action={() => deleteClient(id)}
              />
            </AdminGuard>
          </CustomDropdownContent>
        </DropdownMenu>
      ),
    },
  ]
  return <DataTable columns={columns} data={clients} />
}

export { ClientsDatatable }
