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
    hydrateCart();
    hydrateWishlist();
    hydrateAuth();
    seedDatabase();
  }, [hydrateCart, hydrateWishlist, hydrateAuth]);

  return <>{children}</>;
}
