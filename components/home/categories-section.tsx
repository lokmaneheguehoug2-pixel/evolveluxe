'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/lib/types';

export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="luxe-container py-20">
      <div className="text-center mb-12">
        <p className="text-champagne-500 uppercase tracking-[0.3em] text-sm mb-3">
          Explore
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-burgundy-700">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, idx) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-burgundy-700"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.image_url || ''}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/90 via-burgundy-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-serif text-2xl text-champagne-200 mb-1">
                {category.name}
              </h3>
              <p className="text-champagne-200/70 text-sm mb-3 line-clamp-2">
                {category.description}
              </p>
              <span className="inline-flex items-center gap-2 text-champagne-400 text-sm uppercase tracking-wider font-medium group-hover:gap-3 transition-all">
                Shop Now <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
