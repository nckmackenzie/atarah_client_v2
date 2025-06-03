import { createFileRoute } from '@tanstack/react-router'
import FormHeader from '@/components/custom/form-header'
import { useDocumentTitle } from '@/hooks/use-title'
import { ProjectForm } from '@/features/admin/components/projects/projects-form'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'

export const Route = createFileRoute('/_authenticated/projects/new')({
  component: NewProjectRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function NewProjectRouteComponent() {
  useDocumentTitle('New Project')
  return (
    <div className="space-y-8">
      <FormHeader
        title="Add new project"
        description="Fill in all the required details"
      />
      <ProjectForm />
    </div>
  )
}
