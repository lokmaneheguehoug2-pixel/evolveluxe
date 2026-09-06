import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-[100px] luxe-container py-24 text-center">
      <h1 className="font-serif text-4xl text-burgundy-700">Product unavailable</h1>
      <p className="mt-3 text-burgundy/60">This product is no longer available.</p>
      <Link href="/products" className="luxe-btn-primary mt-8 inline-block">Browse products</Link>
    </div>
  );
}
