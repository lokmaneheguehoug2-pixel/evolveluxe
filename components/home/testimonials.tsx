'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Karim Benali',
    location: 'Alger',
    rating: 5,
    text: 'The quality of the eyewear is exceptional. I have been buying luxury brands for years and EVOLVE LUXE matches the best of them. The COD service was seamless.',
    product: 'Noir Aviator Elite',
  },
  {
    name: 'Sofiane Khelifi',
    location: 'Oran',
    rating: 5,
    text: 'The Executive Briefcase is a work of art. The leather has aged beautifully and I get compliments daily. Worth every dinar.',
    product: 'Executive Briefcase Pro',
  },
  {
    name: 'Nassim Touati',
    location: 'Constantine',
    rating: 5,
    text: 'My Chronograph Master II rivals pieces three times the price. The attention to detail and packaging made it feel like a true luxury experience.',
    product: 'Chronograph Master II',
  },
];

export function Testimonials() {
  return (
    <section className="bg-burgundy-700 py-20">
      <div className="luxe-container">
        <div className="text-center mb-12">
          <p className="text-champagne-400 uppercase tracking-[0.3em] text-sm mb-3">
            Client Voices
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-champagne-200">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-burgundy-600/50 backdrop-blur border border-champagne-400/10 rounded-xl p-8 hover:border-champagne-400/30 transition-all duration-500 hover:transform hover:-translate-y-1"
            >
              <Quote className="h-8 w-8 text-champagne-400/40 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-champagne-400 text-champagne-400"
                  />
                ))}
              </div>
              <p className="text-champagne-200/80 leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="border-t border-champagne-400/10 pt-4">
                <p className="font-serif text-champagne-200 text-lg">{t.name}</p>
                <p className="text-champagne-200/50 text-sm">
                  {t.location} · {t.product}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
