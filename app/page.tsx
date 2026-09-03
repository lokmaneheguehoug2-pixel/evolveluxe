import { HeroCarousel } from '@/components/home/hero-carousel';
import { CategoriesSection } from '@/components/home/categories-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { FlashSale } from '@/components/home/flash-sale';
import { Testimonials } from '@/components/home/testimonials';
import { FeaturesBar } from '@/components/home/features-bar';
import { getCategories, getProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, featuredProducts, saleProducts] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ onSale: true, limit: 4 }),
  ]);

  return (
    <div className="pt-[80px]">
      <HeroCarousel />
      <FeaturesBar />
      <CategoriesSection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <FlashSale products={saleProducts} />
      <Testimonials />
    </div>
  );
}
