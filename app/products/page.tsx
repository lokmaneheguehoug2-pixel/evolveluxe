import { ProductsView } from '@/components/product/products-view';
import { getCategories, getProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sale?: string; search?: string };
}) {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: searchParams.category,
      onSale: searchParams.sale === 'true',
      search: searchParams.search,
    }),
  ]);

  return (
    <div className="pt-[100px]">
      <ProductsView
        products={products}
        categories={categories}
        activeCategory={searchParams.category}
        activeSale={searchParams.sale === 'true'}
        searchQuery={searchParams.search}
      />
    </div>
  );
}
