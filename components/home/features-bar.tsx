'use client';

import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

export function FeaturesBar() {
  const features = [
    {
      icon: Truck,
      title: 'Free Delivery',
      desc: 'On all orders across Algeria',
    },
    {
      icon: ShieldCheck,
      title: 'Authentic Products',
      desc: '100% genuine luxury guarantee',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      desc: '7-day return policy',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Dedicated customer service',
    },
  ];

  return (
    <section className="luxe-container py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-champagne-100 transition-colors"
          >
            <div className="bg-burgundy-700/10 p-3 rounded-full mb-3">
              <f.icon className="h-6 w-6 text-burgundy-700" />
            </div>
            <h3 className="font-serif text-burgundy-700 text-lg">{f.title}</h3>
            <p className="text-burgundy/50 text-sm mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
