import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/invoices/payments/$paymentId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/invoices/payments/$paymentId/edit"!</div>
}
