'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('id');

  return (
    <div className="pt-[100px] luxe-container py-20 min-h-[60vh]">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-serif text-4xl text-burgundy-700 mb-3">
          Order Placed Successfully!
        </h1>
        <p className="text-burgundy/60 mb-2">
          Thank you for your purchase. We&apos;ll call you shortly to confirm your order.
        </p>
        {orderId && (
          <p className="text-burgundy/50 text-sm mb-8">
            Order ID: <span className="font-mono font-medium text-burgundy-700">{orderId}</span>
          </p>
        )}

        <div className="bg-champagne-100 rounded-lg p-6 mb-8">
          <h2 className="font-serif text-xl text-burgundy-700 mb-4">What happens next?</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-burgundy-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-burgundy-700">Order Processing</p>
                <p className="text-sm text-burgundy/60">We prepare your items for shipment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-burgundy-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-burgundy-700">Out for Delivery</p>
                <p className="text-sm text-burgundy/60">Your order is on its way to your address.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-burgundy-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-burgundy-700">Cash on Delivery</p>
                <p className="text-sm text-burgundy/60">Pay in cash when your order arrives.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account" className="luxe-btn-primary">
            View My Orders
          </Link>
          <Link href="/products" className="luxe-btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
