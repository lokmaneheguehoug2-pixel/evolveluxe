'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Tag, Loader2, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { validateCoupon, createOrder, formatPrice, calculateLoyaltyPoints, getStoreSettings } from '@/lib/data';
import type { StoreSettings } from '@/lib/types';
import { WILAYAS, getWilayaDeliveryDays, getWilayaRate } from '@/lib/wilayas';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clear } = useCartStore();
  const subtotal = getSubtotal();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    wilaya: '',
    address: '',
    notes: '',
    shipping_method: 'home' as 'home' | 'office',
  });
  const [shippingSettings, setShippingSettings] = useState<StoreSettings | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active) setShippingSettings(null);
    }, 5000);
    getStoreSettings()
      .then((settings) => { if (active) setShippingSettings(settings); })
      .catch((error) => console.warn('[v0] Shipping settings unavailable', error))
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; window.clearTimeout(timeout); };
  }, []);

  const shippingPromotionActive = Boolean(shippingSettings?.free_shipping_enabled && (!shippingSettings.free_shipping_until || new Date(shippingSettings.free_shipping_until) >= new Date()));
  const selectedWilaya = WILAYAS.find((wilaya) => wilaya.name === form.wilaya);
  const shippingCostFor = (method: 'home' | 'office') => getWilayaRate(shippingSettings?.wilaya_shipping_rates, selectedWilaya?.code, method === 'office' ? 'desk' : 'home');
  const shippingCost = shippingPromotionActive ? 0 : shippingCostFor(form.shipping_method);
  const deliveryDays = selectedWilaya ? getWilayaDeliveryDays(shippingSettings?.wilaya_shipping_rates, selectedWilaya.code) : 'Select a Wilaya to see delivery timing';
  const total = subtotal - discount + shippingCost;
  const loyaltyPoints = calculateLoyaltyPoints(total);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    const result = await validateCoupon(couponCode, subtotal);
    setValidating(false);
    if (result.valid && result.discount) {
      setDiscount(result.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You saved ${formatPrice(result.discount)}`);
    } else {
      toast.error(result.error || 'Invalid coupon');
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createOrder({
      ...form,
      items: (items ?? []).filter(Boolean).map((item) => ({
        product_id: item.productId || (item as { id?: string }).id || 'custom_product',
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        unit_price: item.price,
        variant_color: item.variantColor,
        variant_size: item.variantSize,
      })),
      subtotal,
      discount,
      total,
      coupon_code: couponApplied ? couponCode : undefined,
      loyalty_points_earned: loyaltyPoints,
      shipping_method: form.shipping_method,
      shipping_cost: shippingCost,
    });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      clear();
      if (result.order) {
        void fetch('/api/telegram/order', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ order: result.order }),
        }).catch((error) => console.warn('[v0] Telegram notification unavailable', error));
      }
      toast.success('Order placed successfully!');
      router.push(`/order-success?id=${result.order?.id}`);
    } catch (error) {
      console.warn('[v0] Guest checkout failed', error);
      toast.error('Unable to place your order. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-[100px] luxe-container py-20 text-center min-h-[60vh]">
        <h1 className="font-serif text-4xl text-burgundy-700 mb-4">
          Your cart is empty
        </h1>
        <p className="text-burgundy/50 mb-6">
          Add some products before checking out.
        </p>
        <Link href="/products" className="luxe-btn-primary inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-[100px] luxe-container py-12">
      <h1 className="font-serif text-4xl text-burgundy-700 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-champagne-100 rounded-lg p-6">
            <h2 className="font-serif text-2xl text-burgundy-700 mb-4">
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="luxe-label">Full Name *</label>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="luxe-input"
                  placeholder="Ahmed Benali"
                />
              </div>
              <div>
                <label className="luxe-label">Phone Number *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="luxe-input"
                  placeholder="0555 123 456"
                />
              </div>
              <div className="md:col-span-2">
                <label className="luxe-label">Wilaya (State) *</label>
                <select
                  required
                  value={form.wilaya}
                  onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                  className="luxe-input cursor-pointer"
                >
                  <option value="">Select your wilaya</option>
                  {WILAYAS.map((wilaya) => (
                    <option key={wilaya.code} value={wilaya.name}>{wilaya.code} — {wilaya.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="luxe-label">Delivery Method *</label>
                <select required value={form.shipping_method} onChange={(e) => setForm({ ...form, shipping_method: e.target.value as 'home' | 'office' })} className="luxe-input cursor-pointer">
                  <option value="home">Livraison à Domicile — {formatPrice(shippingPromotionActive ? 0 : shippingCostFor('home'))}</option>
                  <option value="office">Livraison Stop Desk — {formatPrice(shippingPromotionActive ? 0 : shippingCostFor('office'))}</option>
                </select>
              </div>
              <div className="md:col-span-2 rounded-md border border-burgundy/10 bg-champagne-200/40 px-4 py-3 text-sm text-burgundy-700" aria-live="polite">
                <span className="font-medium">Estimated delivery:</span> {deliveryDays}
              </div>
              <div className="md:col-span-2">
                <label className="luxe-label">Detailed Address *</label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="luxe-input min-h-[100px]"
                  placeholder="Street, building, apartment, landmark..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="luxe-label">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="luxe-input min-h-[60px]"
                  placeholder="Delivery instructions..."
                />
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-champagne-100 rounded-lg p-6">
            <h2 className="font-serif text-2xl text-burgundy-700 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" /> Coupon Code
            </h2>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="luxe-input flex-1"
                placeholder="EVOLVE10"
                disabled={couponApplied}
              />
              {couponApplied ? (
                <button
                  type="button"
                  onClick={() => {
                    setCouponApplied(false);
                    setDiscount(0);
                    setCouponCode('');
                  }}
                  className="luxe-btn-outline"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={validating}
                  className="luxe-btn-primary"
                >
                  {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </button>
              )}
            </div>
            {couponApplied && (
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Coupon applied — you saved {formatPrice(discount)}
              </p>
            )}
            <p className="text-burgundy/40 text-xs mt-2">
              Try: EVOLVE10, LUXE20, WELCOME500, VIP2500
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-champagne-100 rounded-lg p-6 h-fit sticky top-24">
            <h2 className="font-serif text-2xl text-burgundy-700 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-burgundy-700 line-clamp-1">{item.name}</p>
                    <p className="text-burgundy/50 text-xs">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-burgundy-700 font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-burgundy/10 pt-4">
              <div className="flex justify-between text-burgundy/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-burgundy/70">
                <span>Shipping ({form.shipping_method === 'office' ? 'Stop Desk' : 'Home'})</span>
                <span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
            </div>
            <div className="border-t border-burgundy/10 pt-4 mt-4 mb-4">
              <div className="flex justify-between font-serif text-2xl text-burgundy-700">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Loyalty */}
            <div className="bg-burgundy-700/10 rounded-md p-3 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-champagne-500" />
              <p className="text-sm text-burgundy-700">
                You&apos;ll earn <strong>{loyaltyPoints} loyalty points</strong> with this order
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-burgundy-700 text-champagne-200 font-medium uppercase tracking-wider py-4 rounded-md hover:bg-burgundy-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Placing Order...</>
              ) : (
                <>Place Order (Cash on Delivery)</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
