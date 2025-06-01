import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface SheetProviderProps {
  children: React.ReactNode
}

interface SheetContextType {
  isOpen: boolean
  setOpen: (sheetContent: React.ReactNode, options?: SheetOptions) => void
  setClose: () => void
}

interface SheetOptions {
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  sheetTitle?: string
  sheetDescription?: string
}

const SheetContext = React.createContext<SheetContextType>({
  isOpen: false,
  setClose: () => {},
  setOpen: () => {},
})

export const SheetProvider = ({ children }: SheetProviderProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showingSheet, setShowingSheet] = React.useState<React.ReactNode>(null)
  const [sheetOptions, setSheetOptions] = React.useState<SheetOptions>({
    side: 'right',
    sheetTitle: 'Sheet Title',
  })
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const setOpen = (sheetContent: React.ReactNode, options?: SheetOptions) => {
    if (sheetContent) {
      setIsOpen(true)
      setShowingSheet(sheetContent)
      setSheetOptions({ side: 'right', ...options })
    }
  }

  const setClose = () => {
    setIsOpen(false)

    setTimeout(() => {
      setShowingSheet(null)
    }, 300)
  }

  if (!isMounted) return null

  return (
    <SheetContext.Provider value={{ setClose, setOpen, isOpen }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setClose}>
        <SheetContent
          side={sheetOptions.side}
          className={sheetOptions.className}
        >
          <SheetHeader>
            <SheetTitle>{sheetOptions.sheetTitle}</SheetTitle>

            <SheetDescription
              className={cn('', { 'sr-only': !sheetOptions.sheetDescription })}
            >
              {sheetOptions.sheetDescription
                ? sheetOptions.sheetDescription
                : "Make changes and click save when you're done."}
            </SheetDescription>
          </SheetHeader>
          {showingSheet}
        </SheetContent>
      </Sheet>
    </SheetContext.Provider>
  )
}

export const useSheet = () => {
  const context = React.use(SheetContext)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (context === undefined)
    throw new Error('useSheet must be used within a SheetProvider.')

  return context
}
