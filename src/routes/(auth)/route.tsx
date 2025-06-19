import { Outlet, createFileRoute } from '@tanstack/react-router'
import logo from '@/assets/ATH.png'

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Atarah solutions logo"
          src={logo}
          className="mx-auto h-16 w-auto"
        />
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
