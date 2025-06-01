import type { PropsWithChildren } from 'react'

interface PageHeaderProps extends PropsWithChildren {
  title: string
  description?: string
}

export default function PageHeader({
  title,
  children,
  description,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {children}
    </header>
  )
}
