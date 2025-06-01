import { createFileRoute } from '@tanstack/react-router'
import ClientForm from '@/features/admin/components/clients/client-form'
import { FormLoader } from '@/components/custom/loaders'
import { useDocumentTitle } from '@/hooks/use-title'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/clients/new')({
  component: NewClientRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function NewClientRouteComponent() {
  useDocumentTitle('Create Client')
  return <ClientForm />
}
