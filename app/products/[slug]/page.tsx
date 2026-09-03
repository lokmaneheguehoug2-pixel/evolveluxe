import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/lib/data';
import { ProductDetail } from '@/components/product/product-detail';

export const dynamic = 'force-dynamic';

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return {
    title: 'Product — EVOLVE LUXE',
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
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
