export default function Loading() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center p-6" aria-live="polite" aria-busy="true">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading Evolve Luxe...</p>
      </div>
    </main>
  )
}
