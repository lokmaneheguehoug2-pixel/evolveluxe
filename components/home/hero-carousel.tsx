'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

const slides: Slide[] = [
  {
    image:
      'https://images.pexels.com/photos/30953652/pexels-photo-30953652.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'New Arrivals',
    subtitle: 'Autumn / Winter 2026 Collection',
    cta: 'Discover',
    href: '/products',
  },
  {
    image:
      'https://images.pexels.com/photos/8718334/pexels-photo-8718334.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Eyewear Reimagined',
    subtitle: 'Hand-crafted luxury sunglasses',
    cta: 'Shop Sunglasses',
    href: '/products?category=sunglasses',
  },
  {
    image:
      'https://images.pexels.com/photos/7697958/pexels-photo-7697958.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'The Gentleman Edit',
    subtitle: 'Curated essentials for the modern man',
    cta: 'Explore',
    href: '/products',
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
            style={{ filter: 'brightness(0.5)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/80 via-burgundy-900/30 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`text-center px-4 transition-all duration-1000 ${
                idx === current
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <p className="text-champagne-400 uppercase tracking-[0.3em] text-sm md:text-base mb-4 font-medium">
                {slide.subtitle}
              </p>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-champagne-200 mb-8 leading-tight">
                {slide.title}
              </h1>
              <Link
                href={slide.href}
                className="inline-block bg-champagne-400 text-burgundy-700 font-medium uppercase tracking-[0.2em] text-sm px-10 py-4 rounded-md hover:bg-champagne-300 transition-all duration-300 hover:shadow-2xl hover:shadow-champagne-400/30"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-burgundy-700/40 backdrop-blur text-champagne-200 rounded-full hover:bg-burgundy-700/60 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-burgundy-700/40 backdrop-blur text-champagne-200 rounded-full hover:bg-burgundy-700/60 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current
                ? 'w-8 bg-champagne-400'
                : 'w-2 bg-champagne-200/40 hover:bg-champagne-200/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
