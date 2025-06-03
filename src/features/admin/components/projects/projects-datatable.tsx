import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Project } from '@/features/admin/utils/admin.types'
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
import { deleteProject } from '@/features/admin/services/api'

interface ProjectsDatatableProps {
  projects: Array<Project>
}

function ProjectsDatatable({ projects }: ProjectsDatatableProps) {
  const columns: Array<ColumnDef<Project>> = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project Name" />
      ),
    },

    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
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
              <Link to="/projects/$projectId/edit" params={{ projectId: id }}>
                <EditAction />
              </Link>
            </DropdownMenuItem>
            <AdminGuard>
              <DeletePrompt
                action={async () => {
                  await deleteProject(id)
                }}
                description="Are you sure you want to delete this project?"
                toastMessage="Project deleted successfully!"
                invalidateKey={['projects']}
              />
            </AdminGuard>
          </CustomDropdownContent>
        </DropdownMenu>
      ),
    },
  ]
  return <DataTable data={projects} columns={columns} />
}

export { ProjectsDatatable }
