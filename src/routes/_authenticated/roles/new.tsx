import { createFileRoute } from '@tanstack/react-router'
import { CustomAlert } from '@/components/custom/custom-alert'
import { FormLoader } from '@/components/custom/loaders'
import { RolesForm } from '@/features/admin/components/roles/roles-form'

export const Route = createFileRoute('/_authenticated/roles/new')({
  component: RouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => (
    <CustomAlert variant="error" description={error.message} />
  ),
})

function RouteComponent() {
  return (
    <div>
      <RolesForm />
    </div>
  )
}
