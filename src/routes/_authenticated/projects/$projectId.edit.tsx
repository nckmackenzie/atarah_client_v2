import { createFileRoute } from '@tanstack/react-router'
import FormHeader from '@/components/custom/form-header'
import { ProjectForm } from '@/features/admin/components/projects/projects-form'
import { useDocumentTitle } from '@/hooks/use-title'
import { FormLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import { projectQueryOptions } from '@/features/admin/services/query-options'
import { titleCase } from '@/lib/formatters'

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/edit',
)({
  loader: async ({ params: { projectId }, context }) =>
    await context.queryClient.ensureQueryData(
      projectQueryOptions.project(projectId),
    ),
  component: EditProjectRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function EditProjectRouteComponent() {
  const { data } = Route.useLoaderData()
  useDocumentTitle(`Edit ${titleCase(data.name)} project`)
  return (
    <div className="space-y-8">
      <FormHeader
        title="Edit Project"
        description="Update the project details below"
      />
      <ProjectForm project={data} />
    </div>
  )
}
