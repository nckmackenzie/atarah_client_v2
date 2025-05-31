import { useTransition } from 'react'
import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AlertDialogDemoProps {
  action: () => Promise<void>
  description: string
}

export function AlertDialogDemo({ action, description }: AlertDialogDemoProps) {
  const [isLoading, startTransition] = useTransition()
  function performAction() {
    startTransition(async () => {
      try {
        await action()
        // toast.success(toastMessage || 'Action performed successfully!');
        // onSuccess?.();
      } catch (err) {
        // console.log(err);
        toast.error(
          err instanceof Error
            ? err.message
            : 'An error occurred while performing the action.',
        )
      }
    })
  }
  return (
    <AlertDialog open={isLoading ? true : undefined}>
      <AlertDialogTrigger asChild>
        <button className="w-full hover:bg-destructive/10 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm flex data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative   outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <Trash2Icon className="icon text-destructive" />
          <span className="text-destructive">Delete</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white transition-colors hover:bg-destructive/80"
            disabled={isLoading}
            onClick={performAction}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
