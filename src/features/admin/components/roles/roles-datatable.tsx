import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Role } from '@/features/admin/utils/admin.types'
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
import axios from '@/lib/api/axios'

interface RolesdatatableProps {
  roles: Array<Role>
}

function Rolesdatatable({ roles }: RolesdatatableProps) {
  const columns: Array<ColumnDef<Role>> = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role Name" />
      ),
    },
    {
      accessorKey: 'usersCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="No of Users" />
      ),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({
        row: {
          original: { isActive },
        },
      }) => (
        <CustomStatusBadge
          variant={isActive ? 'success' : 'error'}
          text={isActive ? 'Active' : 'Inactive'}
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
              <Link to="/roles/$roleId/edit" params={{ roleId: id }}>
                <EditAction />
              </Link>
            </DropdownMenuItem>
            <AdminGuard>
              <DeletePrompt
                action={async () => {
                  await axios.delete('/api/roles/' + id)
                }}
                description="Are you sure you want to delete this role?"
                toastMessage="Role deleted successfully!"
                invalidateKey={['roles']}
              />
            </AdminGuard>
          </CustomDropdownContent>
        </DropdownMenu>
      ),
    },
  ]
  return <DataTable data={roles} columns={columns} />
}

export { Rolesdatatable }
