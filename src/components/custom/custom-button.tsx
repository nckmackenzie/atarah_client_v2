import { MoreVertical, PencilIcon, Trash2Icon } from 'lucide-react'

export function MoreButton() {
  return (
    <button>
      <MoreVertical className="icon-muted" />
    </button>
  )
}

export function EditAction() {
  return (
    <>
      <PencilIcon className="icon-muted" />
      <span>Edit</span>
    </>
  )
}

export function DeleteAction() {
  return (
    <>
      <Trash2Icon className="icon text-destructive" />
      <span className="text-destructive">Delete</span>
    </>
  )
}
