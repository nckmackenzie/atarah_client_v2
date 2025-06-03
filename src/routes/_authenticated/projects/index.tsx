import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { projectQueryOptions } from '@/features/admin/services/query-options'
import { searchValidateSchema } from '@/lib/schema-rules'
import { AuthedPageLoader } from '@/components/custom/loaders'
import { ErrorNotification } from '@/components/custom/error-component'
import PageHeader from '@/components/custom/page-header'
import Search from '@/components/custom/search'
import { useDocumentTitle } from '@/hooks/use-title'
import { ProjectsDatatable } from '@/features/admin/components/projects/projects-datatable'

export const Route = createFileRoute('/_authenticated/projects/')({
  validateSearch: searchValidateSchema,
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ context, deps: { q } }) =>
    await context.queryClient.ensureQueryData(projectQueryOptions.all(q)),
  component: ProjectsIndexRouteComponent,
  pendingComponent: () => <AuthedPageLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function ProjectsIndexRouteComponent() {
  useDocumentTitle('Projects')
  const { q } = Route.useSearch()
  const {
    data: { data: projects },
  } = useSuspenseQuery(projectQueryOptions.all(q))
  const navigate = useNavigate({ from: Route.fullPath })
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage projects created."
        path="/projects/new"
      />
      <Search
        defaultValue={q}
        placeholder="Search by project name,description"
        parentClassName="w-full md:w-1/2"
        onHandleSearch={(value) =>
          navigate({
            search: (prev) => ({
              ...prev,
              q: value.trim().length > 0 ? value : undefined,
            }),
          })
        }
      />
      <ProjectsDatatable projects={projects} />
    </div>
  )
}
