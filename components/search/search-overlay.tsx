'use client';

import { useState, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchStore } from '@/components/layout/header';
import { getProducts } from '@/lib/data';
import { formatPrice } from '@/lib/data';
import type { Product } from '@/lib/types';

export function SearchOverlay() {
  const { isOpen, setOpen } = useSearchStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const products = await getProducts({ search: query, limit: 8 });
      setResults(products);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-burgundy-900/70 backdrop-blur-md z-[80] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />
      <div
        className={`fixed top-0 left-0 right-0 z-[90] bg-champagne-50 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="luxe-container py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-burgundy-700">Search</h2>
            <button
              onClick={close}
              className="text-burgundy/60 hover:text-burgundy-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-burgundy/40" />
            <input
              autoFocus={isOpen}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for eyewear, bags, watches..."
              className="w-full bg-white/60 border border-burgundy/20 rounded-lg pl-12 pr-4 py-4 text-lg text-burgundy-700 placeholder:text-burgundy/40 focus:outline-none focus:ring-2 focus:ring-champagne-400 focus:border-transparent transition-all"
            />
          </div>

          {loading && (
            <p className="text-burgundy/40 text-sm mt-4 animate-pulse">
              Searching...
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="mt-6 space-y-2 max-h-[60vh] overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={close}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/60 transition-colors group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-serif text-burgundy-700 group-hover:text-burgundy-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-sm text-champagne-500 font-semibold">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-burgundy/40 text-sm mt-4">
              No products found. Try a different search.
            </p>
          )}

          {!query && (
            <div className="mt-6">
              <p className="text-sm text-burgundy/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Sunglasses', 'Leather Bag', 'Watch', 'Aviator', 'Briefcase'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 bg-white/50 border border-burgundy/10 rounded-full text-sm text-burgundy/70 hover:bg-champagne-400 hover:text-burgundy-700 transition-all"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
