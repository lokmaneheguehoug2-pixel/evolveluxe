'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clear } = useCartStore();
  const subtotal = getSubtotal();

  return (
    <div className="pt-[100px] luxe-container py-12 min-h-[60vh]">
      <h1 className="font-serif text-4xl text-burgundy-700 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 text-burgundy/20 mx-auto mb-4" />
          <p className="text-burgundy/60 font-medium text-lg mb-2">
            Your cart is empty
          </p>
          <p className="text-burgundy/40 mb-6">
            Discover our luxury collection
          </p>
          <Button asChild className="luxe-btn-primary">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantColor}-${item.variantSize}-${idx}`}
                className="flex gap-4 bg-champagne-100 rounded-lg p-4"
              >
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-md object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-serif text-lg text-burgundy-700 hover:text-burgundy-600"
                  >
                    {item.name}
                  </Link>
                  {item.variantColor && (
                    <p className="text-sm text-burgundy/50 mt-1">
                      {item.variantColor}
                      {item.variantSize ? ` · ${item.variantSize}` : ''}
                    </p>
                  )}
                  <p className="text-champagne-500 font-semibold mt-1">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center justify-between mt-3">
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
                        className="p-2 text-burgundy-700 hover:bg-burgundy/5"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.variantColor,
                            item.variantSize
                          )
                        }
                        className="p-2 text-burgundy-700 hover:bg-burgundy/5"
                      >
                        <Plus className="h-4 w-4" />
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
                      className="text-burgundy/40 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={clear}
              className="text-sm text-burgundy/40 hover:text-red-600 transition-colors"
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <div className="bg-champagne-100 rounded-lg p-6 h-fit sticky top-24">
            <h2 className="font-serif text-2xl text-burgundy-700 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-burgundy/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-burgundy/70">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>
            <div className="border-t border-burgundy/10 pt-4 mb-6">
              <div className="flex justify-between font-serif text-xl text-burgundy-700">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Button asChild className="luxe-btn-primary w-full">
              <Link href="/checkout">
                Checkout (COD) <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="luxe-btn-outline w-full mt-2">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
