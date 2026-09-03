'use client';

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity, getSubtotal } =
    useCartStore();
  const subtotal = getSubtotal();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-burgundy-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-champagne-50 z-[70] shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-burgundy/10 bg-burgundy-700">
          <h2 className="font-serif text-xl text-champagne-200 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your Cart
          </h2>
          <button
            onClick={close}
            className="text-champagne-200 hover:text-champagne-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-burgundy/20 mb-4" />
            <p className="text-burgundy/60 font-medium mb-2">Your cart is empty</p>
            <p className="text-burgundy/40 text-sm mb-6">
              Discover our luxury collection
            </p>
            <Button
              onClick={close}
              asChild
              className="luxe-btn-primary"
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.variantColor}-${item.variantSize}-${idx}`}
                  className="flex gap-4 bg-white/40 rounded-lg p-3 border border-burgundy/5"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={close}
                    className="shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={close}
                      className="font-serif text-burgundy-700 hover:text-burgundy-600 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.variantColor && (
                      <p className="text-xs text-burgundy/50 mt-0.5">
                        {item.variantColor}
                        {item.variantSize ? ` · ${item.variantSize}` : ''}
                      </p>
                    )}
                    <p className="text-champagne-500 font-semibold text-sm mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-burgundy/20 rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantColor,
                              item.variantSize
                            )
                          }
                          className="p-1.5 text-burgundy-700 hover:bg-burgundy/5 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantColor,
                              item.variantSize
                            )
                          }
                          className="p-1.5 text-burgundy-700 hover:bg-burgundy/5 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(
                            item.productId,
                            item.variantColor,
                            item.variantSize
                          )
                        }
                        className="p-1.5 text-burgundy/40 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-burgundy/10 p-6 bg-white/30">
              <div className="flex justify-between mb-2">
                <span className="text-burgundy/60">Subtotal</span>
                <span className="font-serif text-lg text-burgundy-700">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-burgundy/40 mb-4">
                Shipping calculated at checkout · COD available
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  onClick={close}
                  className="luxe-btn-primary w-full"
                >
                  <Link href="/checkout">Checkout (COD)</Link>
                </Button>
                <Button
                  asChild
                  onClick={close}
                  variant="outline"
                  className="luxe-btn-outline w-full"
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
