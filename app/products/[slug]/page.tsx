import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlugOrId, getRelatedProducts } from '@/lib/data';
import { ProductDetail } from '@/components/product/product-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);
  return {
    title: 'Product — EVOLVE LUXE',
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);
  if (!product) notFound();

  const related = product.category_id
    ? await getRelatedProducts(product.category_id, product.id, 4)
    : [];

  return (
    <div className="pt-[100px]">
      <ProductDetail product={product} related={related} />
    </div>
  );
}
