import React from 'react'

interface DialogProviderProps {
  children: React.ReactNode
}

export type DialogData = {
  //   user?: User;
  //   roles?: Roles[];
  //   categories?: Option[];
  //   uoms?: Option[];
  //   mrqs?: MrqDetailsForOrder[];
}

interface DialogContextType {
  isOpen: boolean
  setOpen: (Dialog: React.ReactNode) => void
  setClose: () => void
}

const DialogContext = React.createContext<DialogContextType>({
  isOpen: false,
  setClose: () => {},
  setOpen: () => {},
})

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showingDialog, setShowingDialog] =
    React.useState<React.ReactNode>(null)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(function () {
    setIsMounted(true)
  }, [])

  const setOpen = (Dialog: React.ReactNode) => {
    if (Dialog) {
      setIsOpen(true)
      setShowingDialog(Dialog)
    }
  }

  const setClose = () => {
    setIsOpen(false)
  }

  if (!isMounted) return null

  return (
    <DialogContext.Provider value={{ setClose, setOpen, isOpen }}>
      {children}
      {showingDialog}
    </DialogContext.Provider>
  )
}

export const useDialog = () => {
  const context = React.use(DialogContext)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (context === undefined)
    throw new Error('useDialog used outside its provider.')

  return context
}
