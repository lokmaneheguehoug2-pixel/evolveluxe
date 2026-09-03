'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-burgundy-700 text-champagne-200 mt-20">
      <div className="luxe-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-serif text-2xl font-bold text-champagne-200">
                EVOLVE
              </span>
              <span className="font-serif text-2xl font-light text-champagne-400">
                LUXE
              </span>
            </div>
            <p className="text-champagne-200/70 text-sm leading-relaxed mb-6">
              Premium men&apos;s luxury eyewear, leather bags, wristwear, and
              accessories. Crafted for the discerning gentleman.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-champagne-200/70 hover:text-champagne-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-champagne-200/70 hover:text-champagne-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-champagne-200/70 hover:text-champagne-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4 text-champagne-200">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products?category=sunglasses" className="text-champagne-200/70 hover:text-champagne-400 transition-colors">
                  Sunglasses
                </Link>
              </li>
              <li>
                <Link href="/products?category=leather-bags" className="text-champagne-200/70 hover:text-champagne-400 transition-colors">
                  Leather Bags
                </Link>
              </li>
              <li>
                <Link href="/products?category=wristwear" className="text-champagne-200/70 hover:text-champagne-400 transition-colors">
                  Wristwear
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-champagne-200/70 hover:text-champagne-400 transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4 text-champagne-200">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/account" className="text-champagne-200/70 hover:text-champagne-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-champagne-200/70 hover:text-champagne-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <span className="text-champagne-200/70">Shipping & Returns</span>
              </li>
              <li>
                <span className="text-champagne-200/70">FAQ</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4 text-champagne-200">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-champagne-200/70">
                <Phone className="h-4 w-4" /> +213 555 000 000
              </li>
              <li className="flex items-center gap-2 text-champagne-200/70">
                <Mail className="h-4 w-4" /> contact@evolveluxe.dz
              </li>
              <li className="flex items-center gap-2 text-champagne-200/70">
                <MapPin className="h-4 w-4" /> Alger, Algeria
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-champagne-400/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-champagne-200/50 text-sm">
            © {new Date().getFullYear()} EVOLVE LUXE. All rights reserved.
          </p>
          <p className="text-champagne-200/50 text-sm">
            Cash on Delivery available across all 58 Wilayas
          </p>
        </div>
      </div>
    </footer>
  );
}
