'use client';

import Link from 'next/link';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const hasWishlist = useWishlistStore((s) => s.hasItem(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  const discount = getDiscountPercent(product.price, product.original_price || 0);
  const inWishlist = hasWishlist;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
    });
    toast.success(
      inWishlist ? 'Removed from wishlist' : 'Added to wishlist'
    );
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="luxe-card relative">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-champagne-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-burgundy-700 text-champagne-200 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                -{discount}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-champagne-400 text-burgundy-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Featured
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sold Out
              </span>
            )}
          </div>
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full transition-all duration-300',
              inWishlist
                ? 'bg-burgundy-700 text-champagne-200'
                : 'bg-white/80 text-burgundy-700 hover:bg-burgundy-700 hover:text-champagne-200'
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
          </button>
          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-burgundy-700/95 backdrop-blur text-champagne-200 font-medium uppercase tracking-wider text-sm py-3 rounded-md hover:bg-burgundy-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              {product.stock === 0 ? 'Sold Out' : 'Quick Add'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-burgundy/40 uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="font-serif text-lg text-burgundy-700 line-clamp-1 group-hover:text-burgundy-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3.5 w-3.5 fill-champagne-400 text-champagne-400" />
            <span className="text-xs text-burgundy/50">
              {product.rating} ({product.review_count})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-serif text-lg text-burgundy-700 font-semibold">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-burgundy/40 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
