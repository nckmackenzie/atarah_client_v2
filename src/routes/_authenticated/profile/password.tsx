import { createFileRoute } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/use-title'
import { ChangePasswordForm } from '@/features/profile/components/change-password-form'

export const Route = createFileRoute('/_authenticated/profile/password')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Password | Profile')
  return (
    <div className="mt-12">
      <ChangePasswordForm />
    </div>
  )
}
