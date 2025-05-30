import classes from './loaders.module.css'

export function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center mt-72 space-y-1">
      <div className={classes['flipping-8']} />
      <p className="text-muted-foreground text-sm animate-pulse">
        Fetching data...
      </p>
    </div>
  )
}
