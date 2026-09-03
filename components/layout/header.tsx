'use client';

import { create } from 'zustand';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Search, User, Menu } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type SearchState = {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
};
export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  setOpen: (v) => set({ isOpen: v }),
}));

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop All' },
  { href: '/products?category=sunglasses', label: 'Sunglasses' },
  { href: '/products?category=leather-bags', label: 'Bags' },
  { href: '/products?category=wristwear', label: 'Wristwear' },
  { href: '/products?category=accessories', label: 'Accessories' },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.getCount());
  const openCart = useCartStore((s) => s.open);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openWishlist = useWishlistStore((s) => s.open);
  const setSearchOpen = useSearchStore((s) => s.setOpen);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-burgundy-700/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-burgundy-700 py-5'
      )}
    >
      <div className="luxe-container flex items-center justify-between gap-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden text-champagne-200 p-1" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-burgundy-700 border-champagne-400/20 w-80"
          >
            <SheetHeader>
              <SheetTitle className="text-champagne-200 font-serif text-2xl">
                EVOLVE LUXE
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-champagne-200 hover:text-champagne-400 transition-colors py-3 px-4 rounded-md hover:bg-burgundy-600 font-medium uppercase tracking-wider text-sm"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="text-champagne-200 hover:text-champagne-400 transition-colors py-3 px-4 rounded-md hover:bg-burgundy-600 font-medium uppercase tracking-wider text-sm"
              >
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif text-2xl md:text-3xl font-bold text-champagne-200 tracking-wider">
            EVOLVE
          </span>
          <span className="font-serif text-2xl md:text-3xl font-light text-champagne-400 tracking-wider">
            LUXE
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-champagne-200 hover:text-champagne-400 transition-colors font-medium uppercase tracking-wider text-sm relative group',
                pathname === link.href.split('?')[0] && 'text-champagne-400'
              )}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-champagne-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-champagne-200 hover:text-champagne-400 transition-colors p-1"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/account"
            className="text-champagne-200 hover:text-champagne-400 transition-colors p-1 hidden sm:block"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            onClick={openWishlist}
            className="text-champagne-200 hover:text-champagne-400 transition-colors p-1 relative"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-champagne-400 text-burgundy-700 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={openCart}
            className="text-champagne-200 hover:text-champagne-400 transition-colors p-1 relative"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-champagne-400 text-burgundy-700 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
