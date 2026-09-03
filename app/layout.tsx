import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { StoreProvider } from '@/components/store-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { SearchOverlay } from '@/components/search/search-overlay';
import { WishlistDrawer } from '@/components/wishlist/wishlist-drawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'EVOLVE LUXE — Premium Men\'s Luxury Eyewear, Bags & Accessories',
    template: '%s | EVOLVE LUXE',
  },
  description:
    'Discover EVOLVE LUXE — a curated collection of premium men\'s eyewear, leather bags, wristwear, and accessories. Crafted for the discerning gentleman. Cash on Delivery available across Algeria.',
  keywords: [
    'luxury eyewear',
    'men\'s sunglasses',
    'leather bags',
    'luxury watches',
    'premium accessories',
    'Algeria luxury store',
    'cash on delivery',
  ],
  openGraph: {
    title: 'EVOLVE LUXE — Premium Men\'s Luxury Store',
    description:
      'Premium men\'s eyewear, leather bags, wristwear, and accessories. Crafted for the discerning gentleman.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.pexels.com" />
      </head>
      <body className="min-h-screen bg-champagne-50 text-burgundy-700 antialiased">
        <StoreProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
          <WishlistDrawer />
          <SearchOverlay />
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
