'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/data';
import { Loader2, Package, Heart, MapPin, LogOut, User as UserIcon, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/lib/stores/wishlist-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { toast } from 'sonner';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, signIn, signUp, signOut, hydrated } = useAuthStore();
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeWishlist = useWishlistStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');

  useEffect(() => {
    if (hydrated && !user) return;
  }, [hydrated, user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getOrders();
      setOrders(data);
    })();
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
    setAuthLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created!');
    }
  };

  const handleAddToCart = (item: (typeof wishlistItems)[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      quantity: 1,
      stock: 99,
    });
    toast.success(`${item.name} added to cart`);
    openCart();
  };

  if (!hydrated || isLoading) {
    return (
      <div className="pt-[100px] min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-[100px] luxe-container py-12 min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-champagne-100 rounded-lg p-8">
            <h1 className="font-serif text-3xl text-burgundy-700 mb-2 text-center">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-burgundy/50 text-center mb-6">
              {mode === 'signin'
                ? 'Welcome back to EVOLVE LUXE'
                : 'Join the EVOLVE LUXE family'}
            </p>
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="luxe-label">Full Name</label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="luxe-input"
                    placeholder="Ahmed Benali"
                  />
                </div>
              )}
              <div>
                <label className="luxe-label">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="luxe-input"
                  placeholder="ahmed@example.com"
                />
              </div>
              <div>
                <label className="luxe-label">Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="luxe-input"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full luxe-btn-primary flex items-center justify-center gap-2"
              >
                {authLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-burgundy/60 mt-4">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-burgundy-700 font-medium hover:text-burgundy-600"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[100px] luxe-container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-burgundy-700">
            Hello, {user.fullName || user.email}
          </h1>
          <p className="text-burgundy/50 text-sm">{user.email}</p>
        </div>
        <button
          onClick={() => {
            signOut();
            router.push('/');
          }}
          className="luxe-btn-outline flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-burgundy/10">
        {[
          { id: 'orders' as const, label: 'Orders', icon: Package },
          { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
          { id: 'profile' as const, label: 'Profile', icon: UserIcon },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 font-medium text-sm uppercase tracking-wider transition-colors border-b-2 -mb-px',
              tab === t.id
                ? 'border-burgundy-700 text-burgundy-700'
                : 'border-transparent text-burgundy/50 hover:text-burgundy-700'
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-burgundy/20 mx-auto mb-4" />
              <p className="text-burgundy/60 mb-4">No orders yet</p>
              <Link href="/products" className="luxe-btn-primary inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-champagne-100 rounded-lg p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-serif text-lg text-burgundy-700">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-burgundy/50">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg text-burgundy-700">
                      {formatPrice(order.total)}
                    </p>
                    <span
                      className={cn(
                        'inline-block text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wider',
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Status timeline */}
                {order.status !== 'cancelled' && (
                  <div className="flex items-center gap-2 mb-4">
                    {STATUS_STEPS.map((step, idx) => {
                      const currentIdx = STATUS_STEPS.indexOf(order.status);
                      const done = idx <= currentIdx;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={cn(
                                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold',
                                done
                                  ? 'bg-burgundy-700 text-champagne-200'
                                  : 'bg-burgundy/10 text-burgundy/40'
                              )}
                            >
                              {idx + 1}
                            </div>
                            <span className="text-xs text-burgundy/60 mt-1 capitalize">
                              {step}
                            </span>
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div
                              className={cn(
                                'h-0.5 flex-1 mx-1',
                                idx < currentIdx ? 'bg-burgundy-700' : 'bg-burgundy/10'
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-burgundy-700">{item.product_name}</p>
                        <p className="text-burgundy/50 text-xs">
                          {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="text-burgundy-700 font-medium">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Wishlist */}
      {tab === 'wishlist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Heart className="h-16 w-16 text-burgundy/20 mx-auto mb-4" />
              <p className="text-burgundy/60 mb-4">Your wishlist is empty</p>
              <Link href="/products" className="luxe-btn-primary inline-block">
                Discover Products
              </Link>
            </div>
          ) : (
            wishlistItems.map((item) => (
              <div key={item.productId} className="bg-champagne-100 rounded-lg p-4 flex gap-4">
                <Link href={`/products/${item.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-serif text-burgundy-700 hover:text-burgundy-600 line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-champagne-500 font-semibold text-sm">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="text-xs bg-burgundy-700 text-champagne-200 px-3 py-1.5 rounded hover:bg-burgundy-600 transition-colors flex items-center gap-1"
                    >
                      <ShoppingBag className="h-3 w-3" /> Add to Cart
                    </button>
                    <button
                      onClick={() => removeWishlist(item.productId)}
                      className="text-xs text-burgundy/40 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <div className="max-w-md space-y-4">
          <div className="bg-champagne-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-burgundy-700 flex items-center justify-center text-champagne-200 font-serif text-lg">
                {(user.fullName || user.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="font-serif text-lg text-burgundy-700">
                  {user.fullName || 'Member'}
                </p>
                <p className="text-sm text-burgundy/50">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-burgundy/70">
                <MapPin className="h-4 w-4" /> Algeria
              </div>
              <div className="flex items-center gap-2 text-burgundy/70">
                <UserIcon className="h-4 w-4" /> {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </div>
            </div>
          </div>
          {user.role === 'admin' && (
            <Link href="/admin" className="luxe-btn-primary block text-center">
              Go to Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
