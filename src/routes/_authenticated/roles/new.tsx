import { createFileRoute } from '@tanstack/react-router'
import { FormLoader } from '@/components/custom/loaders'
import { RolesForm } from '@/features/admin/components/roles/roles-form'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/roles/new')({
  component: RouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function RouteComponent() {
  return (
    <div>
      <RolesForm />
    </div>
  )
}
