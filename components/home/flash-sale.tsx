'use client';

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';
import { formatPrice } from '@/lib/data';

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  return timeLeft;
}

export function FlashSale({ products }: { products: Product[] }) {
  // Sale ends in 2 days from mount
  const [target] = useState(() => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
  const { hours, minutes, seconds } = useCountdown(target);

  if (!products.length) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="luxe-container py-20">
      <div className="bg-burgundy-700 rounded-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-champagne-400 text-burgundy-700 p-2 rounded-full">
                  <Flame className="h-5 w-5" />
                </div>
                <p className="text-champagne-400 uppercase tracking-[0.3em] text-sm font-medium">
                  Limited Time
                </p>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-champagne-200">
                Flash Sale
              </h2>
              <p className="text-champagne-200/60 mt-2">
                Up to 30% off select luxury items
              </p>
            </div>

            {/* Countdown */}
            <div className="flex gap-3">
              {[
                { label: 'Hours', value: pad(hours) },
                { label: 'Minutes', value: pad(minutes) },
                { label: 'Seconds', value: pad(seconds) },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="bg-champagne-400/10 backdrop-blur border border-champagne-400/20 rounded-lg px-4 py-3 text-center min-w-[70px]"
                >
                  <p className="font-serif text-2xl md:text-3xl text-champagne-200 font-bold">
                    {unit.value}
                  </p>
                  <p className="text-champagne-200/50 text-xs uppercase tracking-wider mt-1">
                    {unit.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group block bg-champagne-200 rounded-lg overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 bg-red-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SALE
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-serif text-burgundy-700 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-burgundy-700 font-semibold">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && (
                      <span className="text-burgundy/40 text-sm line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/products?sale=true"
              className="inline-block bg-champagne-400 text-burgundy-700 font-medium uppercase tracking-[0.2em] text-sm px-10 py-4 rounded-md hover:bg-champagne-300 transition-all"
            >
              Shop All Sale Items
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
