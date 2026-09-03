'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantColor?: string, variantSize?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantColor?: string,
    variantSize?: string
  ) => void;
  clear: () => void;
  hydrate: () => void;
  getSubtotal: () => number;
  getCount: () => number;
};

const sameItem = (
  a: CartItem,
  productId: string,
  variantColor?: string,
  variantSize?: string
) =>
  a.productId === productId &&
  a.variantColor === variantColor &&
  a.variantSize === variantSize;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            sameItem(i, item.productId, item.variantColor, item.variantSize)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameItem(i, item.productId, item.variantColor, item.variantSize)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variantColor, variantSize) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameItem(i, productId, variantColor, variantSize)
          ),
        })),
      updateQuantity: (productId, quantity, variantColor, variantSize) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameItem(i, productId, variantColor, variantSize)
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      hydrate: () => set({ hydrated: true }),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'evolve-cart',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
