'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';
import { formatPrice } from '@/lib/data';
import { cn } from '@/lib/utils';

export function ProductsView({
  products,
  categories,
  activeCategory,
  activeSale,
  searchQuery,
}: {
  products: Product[];
  categories: Category[];
  activeCategory?: string;
  activeSale?: boolean;
  searchQuery?: string;
}) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    activeCategory || null
  );
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>(
    'newest'
  );

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        result = result.filter((p) => p.category_id === cat.id);
      }
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    result = result.filter((p) => p.rating >= minRating);

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [products, selectedCategory, priceRange, minRating, sortBy, categories]);

  return (
    <div className="luxe-container py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-burgundy-700 mb-2">
          {searchQuery
            ? `Results for "${searchQuery}"`
            : activeSale
            ? 'Flash Sale'
            : selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name ||
              'Products'
            : 'All Products'}
        </h1>
        <p className="text-burgundy/50">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside
          className={cn(
            'w-64 shrink-0 space-y-6',
            showFilters
              ? 'fixed inset-0 z-50 bg-champagne-50 p-6 overflow-y-auto lg:relative lg:inset-auto lg:bg-transparent lg:p-0'
              : 'hidden lg:block'
          )}
        >
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="font-serif text-2xl text-burgundy-700">Filters</h2>
            <button onClick={() => setShowFilters(false)}>
              <X className="h-6 w-6 text-burgundy-700" />
            </button>
          </div>

          {/* Category */}
          <div>
            <h3 className="luxe-label">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  !selectedCategory
                    ? 'bg-burgundy-700 text-champagne-200'
                    : 'text-burgundy/70 hover:bg-champagne-100'
                )}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    selectedCategory === cat.slug
                      ? 'bg-burgundy-700 text-champagne-200'
                      : 'text-burgundy/70 hover:bg-champagne-100'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="luxe-label">Price Range</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-burgundy/70">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-full accent-burgundy-700"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="luxe-input text-sm py-1.5"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="luxe-input text-sm py-1.5"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="luxe-label">Min Rating</h3>
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    minRating === r
                      ? 'bg-burgundy-700 text-champagne-200'
                      : 'text-burgundy/70 hover:bg-champagne-100'
                  )}
                >
                  {r === 0 ? 'All Ratings' : `${r}+ Stars`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 text-burgundy-700 font-medium text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="luxe-input text-sm py-2 max-w-[200px] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-burgundy/50 text-lg">
                No products match your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange([0, 100000]);
                  setMinRating(0);
                }}
                className="mt-4 text-champagne-500 font-medium hover:text-burgundy-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
