'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[v0] Route failed to render', error);
  }, [error]);

  return (
    <main role="alert" className="flex min-h-[60vh] items-center justify-center bg-background px-6 py-16 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-burgundy/60">EVOLVE LUXE</p>
        <h1 className="font-serif text-3xl text-burgundy-700">We&apos;re preparing the storefront</h1>
        <p className="text-burgundy/65">The store is temporarily loading. Your cart and browsing session are safe.</p>
        <button type="button" onClick={() => reset()} className="luxe-button">Try again</button>
      </div>
    </main>
  );
}
