'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Play,
  X,
  Minus,
  Plus,
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice, getDiscountPercent } from '@/lib/data';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product/product-card';

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.variants?.[0]?.color || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showVideo, setShowVideo] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const inWishlist = useWishlistStore((s) => s.hasItem(product.id));

  const discount = getDiscountPercent(product.price, product.original_price || 0);
  const colors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean) || [])
  );
  const sizes = Array.from(
    new Set(product.variants?.map((v) => v.size).filter(Boolean) || [])
  );

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
      quantity,
      variantColor: selectedColor || undefined,
      variantSize: selectedSize || undefined,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0],
      quantity,
      variantColor: selectedColor || undefined,
      variantSize: selectedSize || undefined,
      stock: product.stock,
    });
    window.location.href = '/checkout';
  };

  return (
    <div className="luxe-container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-burgundy/50 mb-8">
        <Link href="/" className="hover:text-burgundy-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-burgundy-700">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-burgundy-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-champagne-100 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.video_url && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute bottom-4 right-4 bg-burgundy-700/80 backdrop-blur text-champagne-200 p-3 rounded-full hover:bg-burgundy-700 transition-colors"
                aria-label="Play video"
              >
                <Play className="h-5 w-5" />
              </button>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-burgundy-700 text-champagne-200 text-sm font-bold px-3 py-1.5 rounded-full">
                -{discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'h-20 w-20 rounded-md overflow-hidden border-2 transition-all shrink-0',
                    activeImage === idx
                      ? 'border-burgundy-700'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <p className="text-champagne-500 uppercase tracking-[0.3em] text-sm mb-2">
              {product.category.name}
            </p>
          )}
          <h1 className="font-serif text-3xl md:text-4xl text-burgundy-700 mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.round(product.rating)
                      ? 'fill-champagne-400 text-champagne-400'
                      : 'text-burgundy/20'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-burgundy/60">
              {product.rating} ({product.review_count} reviews)
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="font-serif text-3xl text-burgundy-700 font-bold">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xl text-burgundy/40 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full',
                product.stock > 10
                  ? 'bg-green-100 text-green-700'
                  : product.stock > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  product.stock > 10
                    ? 'bg-green-500'
                    : product.stock > 0
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                )}
              />
              {product.stock > 10
                ? 'In Stock'
                : product.stock > 0
                ? `Only ${product.stock} left`
                : 'Out of Stock'}
            </span>
          </div>

          <p className="text-burgundy/70 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Variants */}
          {colors.length > 0 && (
            <div className="mb-6">
              <p className="luxe-label">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'px-4 py-2.5 rounded-md border-2 transition-all text-sm font-medium',
                      selectedColor === color
                        ? 'border-burgundy-700 bg-burgundy-700 text-champagne-200'
                        : 'border-burgundy/20 text-burgundy-700 hover:border-burgundy/40'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="luxe-label">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'px-4 py-2.5 rounded-md border-2 transition-all text-sm font-medium',
                      selectedSize === size
                        ? 'border-burgundy-700 bg-burgundy-700 text-champagne-200'
                        : 'border-burgundy/20 text-burgundy-700 hover:border-burgundy/40'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <p className="luxe-label">Quantity</p>
            <div className="flex items-center border border-burgundy/20 rounded-md w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-burgundy-700 hover:bg-burgundy/5 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-6 font-medium text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-3 text-burgundy-700 hover:bg-burgundy/5 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-burgundy-700 text-champagne-200 font-medium uppercase tracking-wider py-4 rounded-md hover:bg-burgundy-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-champagne-400 text-burgundy-700 font-medium uppercase tracking-wider py-4 rounded-md hover:bg-champagne-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now (COD)
            </button>
            <button
              onClick={() => {
                toggleWishlist({
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image: product.images[0],
                });
                toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
              }}
              className={cn(
                'p-4 rounded-md border-2 transition-all',
                inWishlist
                  ? 'border-burgundy-700 bg-burgundy-700 text-champagne-200'
                  : 'border-burgundy/20 text-burgundy-700 hover:border-burgundy/40'
              )}
            >
              <Heart className={cn('h-5 w-5', inWishlist && 'fill-current')} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-burgundy/10">
            {[
              { icon: Truck, label: 'Free Delivery' },
              { icon: ShieldCheck, label: 'Authentic' },
              { icon: RotateCcw, label: '7-Day Returns' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-2">
                <item.icon className="h-6 w-6 text-burgundy-700" />
                <span className="text-xs text-burgundy/60 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-3xl text-burgundy-700 mb-8">
            Customer Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-champagne-100 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-serif text-lg text-burgundy-700">
                      {review.author_name}
                    </p>
                    {review.is_verified && (
                      <span className="text-xs text-green-600 font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < review.rating
                            ? 'fill-champagne-400 text-champagne-400'
                            : 'text-burgundy/20'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-burgundy/70 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-3xl text-burgundy-700 mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Video Modal */}
      {showVideo && product.video_url && (
        <div
          className="fixed inset-0 bg-burgundy-900/80 backdrop-blur z-[100] flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-champagne-200 hover:text-champagne-400"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <video
                src={product.video_url}
                controls
                autoPlay
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
