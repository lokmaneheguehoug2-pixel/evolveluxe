'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-champagne-100 py-20">
      <div className="luxe-container">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-champagne-500 uppercase tracking-[0.3em] text-sm mb-3">
              Curated Selection
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-burgundy-700">
              Featured Collection
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 text-burgundy-700 hover:text-burgundy-600 transition-colors font-medium uppercase tracking-wider text-sm group"
          >
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-burgundy-700 font-medium uppercase tracking-wider text-sm"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
