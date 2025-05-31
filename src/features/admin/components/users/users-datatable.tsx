import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { User } from '@/features/admin/utils/admin.types'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/custom/datatable'
import { DataTableColumnHeader } from '@/components/custom/datatable-column-header'
import { CustomStatusBadge } from '@/components/custom/status-badges'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditAction } from '@/components/custom/custom-button'
import CustomDropdownContent from '@/components/custom/custom-dropdown-content'
import { AdminGuard } from '@/components/custom/admin-guard'
import { AlertDialogDemo } from '@/components/custom/delete-prompt'
import axios from '@/lib/api/axios'

export function UsersDatatable({ users }: { users: Array<User> }) {
  // simulate an async task
  const deleteUser = async (id: string) => {
    await axios.delete('/api/users/' + id)
  }

  const columns: Array<ColumnDef<User>> = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User Name" />
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
      accessorKey: 'role.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
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
            <button>
              <MoreVertical className="icon-muted" />
            </button>
          </DropdownMenuTrigger>
          <CustomDropdownContent>
            <DropdownMenuItem asChild>
              <Link to="/users/$userId/edit" params={{ userId: id }}>
                <EditAction />
              </Link>
            </DropdownMenuItem>
            <AdminGuard>
              <AlertDialogDemo
                description="This action cannot be undone. This will permanently delete the selected user."
                action={() => deleteUser(id)}
              />
            </AdminGuard>
          </CustomDropdownContent>
        </DropdownMenu>
      ),
    },
  ]
  return <DataTable data={users} columns={columns} />
}
