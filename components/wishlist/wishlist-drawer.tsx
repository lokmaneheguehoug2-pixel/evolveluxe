'use client';

import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function WishlistDrawer() {
  const { items, isOpen, close, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAddToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      quantity: 1,
      stock: 99,
    });
    toast.success(`${item.name} added to cart`);
    close();
    openCart();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-burgundy-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-champagne-50 z-[70] shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-burgundy/10 bg-burgundy-700">
          <h2 className="font-serif text-xl text-champagne-200 flex items-center gap-2">
            <Heart className="h-5 w-5" /> Wishlist
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
            <Heart className="h-16 w-16 text-burgundy/20 mb-4" />
            <p className="text-burgundy/60 font-medium mb-2">
              Your wishlist is empty
            </p>
            <p className="text-burgundy/40 text-sm mb-6">
              Save items you love for later
            </p>
            <Button onClick={close} asChild className="luxe-btn-primary">
              <Link href="/products">Discover Products</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
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
                  <p className="text-champagne-500 font-semibold text-sm mt-1">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="bg-champagne-400 text-burgundy-700 hover:bg-champagne-500 text-xs px-3 h-8"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" /> Add
                    </Button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-burgundy/40 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
