'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[v0] Global application error', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', background: '#f5efe6', color: '#5a1f2b', fontFamily: 'system-ui, sans-serif' }}>
        <main className="flex min-h-screen items-center justify-center p-6 text-center">
          <section className="max-w-md space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Evolve Luxe</p>
            <h1 className="text-2xl font-semibold">The storefront is recovering</h1>
            <p className="text-muted-foreground">A temporary initialization issue prevented this view from loading.</p>
            <button type="button" onClick={() => reset()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
