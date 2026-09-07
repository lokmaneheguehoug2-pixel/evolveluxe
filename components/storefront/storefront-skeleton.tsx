import { Skeleton } from '@/components/ui/skeleton'

export function StorefrontSkeleton() {
  return (
    <div aria-label="Loading storefront" className="luxe-container min-h-[60vh] animate-pulse py-8 sm:py-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-3/4 max-w-md bg-champagne-200" />
        <Skeleton className="h-4 w-2/3 max-w-sm bg-champagne-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg bg-champagne-200/70">
            <Skeleton className="aspect-[4/5] w-full bg-champagne-300/70" />
            <div className="space-y-2 p-3 sm:p-4">
              <Skeleton className="h-4 w-4/5 bg-champagne-300/70" />
              <Skeleton className="h-4 w-2/5 bg-champagne-300/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
