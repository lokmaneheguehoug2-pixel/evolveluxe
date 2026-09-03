'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WishlistItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
};

type WishlistState = {
  items: WishlistItem[];
  isOpen: boolean;
  hydrated: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  hydrate: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) {
            return {
              items: state.items.filter((i) => i.productId !== item.productId),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      hasItem: (productId) => get().items.some((i) => i.productId === productId),
      hydrate: () => set({ hydrated: true }),
    }),
    {
      name: 'evolve-wishlist',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
