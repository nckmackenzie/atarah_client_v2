import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/custom/app-sidebar'
import { formsQueryOptions } from '@/features/auth/utils/query-options'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(formsQueryOptions()),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 border-b items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 md:px-6">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1 block md:hidden" />
          </div>
        </header>
        <div className="flex flex-col flex-1 gap-4 p-4 md:p-6 ">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
