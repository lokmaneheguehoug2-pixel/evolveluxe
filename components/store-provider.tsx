'use client';

import { ReactNode, useEffect } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { seedDatabase } from '@/lib/seed';

export function StoreProvider({ children }: { children: ReactNode }) {
  const hydrateCart = useCartStore((s) => s.hydrate);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    try { hydrateCart?.(); } catch (error) { console.warn('[v0] Cart hydration skipped', error); }
    try { hydrateWishlist?.(); } catch (error) { console.warn('[v0] Wishlist hydration skipped', error); }
    try { hydrateAuth?.(); } catch (error) { console.warn('[v0] Auth hydration skipped', error); }
    void seedDatabase().catch((error) => console.warn('[v0] Database seed skipped', error));
  }, [hydrateCart, hydrateWishlist, hydrateAuth]);

  return <>{children}</>;
}
