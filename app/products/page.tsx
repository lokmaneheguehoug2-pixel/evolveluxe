import { ProductsView } from '@/components/product/products-view';
import { getCategories, getProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sale?: string; search?: string }>;
}) {
  const params = await searchParams;
  const category = typeof params?.category === 'string' ? params.category : undefined;
  const sale = params?.sale === 'true';
  const search = typeof params?.search === 'string' ? params.search : undefined;
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({ category, onSale: sale, search }).catch(() => []),
  ]);

  return (
    <div className="pt-[100px]">
      <ProductsView
        products={Array.isArray(products) ? products : []}
        categories={Array.isArray(categories) ? categories : []}
        activeCategory={category}
        activeSale={sale}
        searchQuery={search}
      />
    </div>
  );
}
