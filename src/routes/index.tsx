import { createFileRoute } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { logout } = useAuth()
  return <Button onClick={() => logout()}>Logout</Button>
}
