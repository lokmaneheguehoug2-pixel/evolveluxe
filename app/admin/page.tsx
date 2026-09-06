'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCategories, getProducts, getOrders, getAllCoupons, getStoreSettings, defaultStoreSettings, updateOrderStatus, formatPrice, calculateLoyaltyPoints } from '@/lib/data';
import type { Product, Order, Coupon, Category, StoreSettings } from '@/lib/types';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Eye,
  LogOut,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsTab } from '@/components/admin/settings-tab';
import { AdminErrorBoundary } from '@/components/admin/admin-error-boundary';

type Tab = 'overview' | 'products' | 'orders' | 'coupons' | 'settings';

const MAX_IMAGE_BYTES = 95 * 1024;
const MAX_IMAGES_BYTES = 800 * 1024;

function dataUrlBytes(value: string) {
  if (!value) return 0;
  if (!value.startsWith('data:')) return new TextEncoder().encode(value).length;
  const base64 = value.split(',')[1] || '';
  return Math.floor((base64.length * 3) / 4);
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      let scale = Math.min(1, 600 / Math.max(image.width, image.height));
      let quality = 0.55;
      let result = '';
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) { URL.revokeObjectURL(objectUrl); reject(new Error('Could not prepare image')); return; }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        result = canvas.toDataURL('image/jpeg', quality);
        if (dataUrlBytes(result) <= MAX_IMAGE_BYTES) break;
        if (quality > 0.4) quality -= 0.05;
        else scale *= 0.85;
      }
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not read image')); };
    image.src = objectUrl;
  });
}

function AdminDashboard() {
  const router = useRouter();
  const { user, hydrated, signOut } = useAuthStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== 'admin') {
      router.replace('/admin/login');
      return;
    }

    let active = true;
    (async () => {
      try {
        const [p, o, c, cat, storeSettings] = await Promise.all([
          getProducts().catch(() => []),
          getOrders().catch(() => []),
          getAllCoupons().catch(() => []),
          getCategories().catch(() => []),
          getStoreSettings().catch(() => null),
        ]);
        if (!active) return;
        setProducts(Array.isArray(p) ? p : []);
        setOrders(Array.isArray(o) ? o : []);
        setCoupons(Array.isArray(c) ? c : []);
        setCategories(Array.isArray(cat) ? cat : []);
        setSettings(storeSettings ?? null);
        setLoadError(null);
      } catch {
        if (active) setLoadError('Some dashboard data could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [hydrated, router, user]);

  if (!hydrated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-burgundy-700 flex items-center justify-center text-champagne-200">
        <Loader2 className="h-7 w-7 animate-spin" aria-label="Checking administrator access" />
      </div>
    );
  }

  const shippingRates = (settings as (StoreSettings & { shippingRates?: { home?: number; desk?: number; freeShipping?: boolean } }) | null)?.shippingRates || { home: 0, desk: 0, freeShipping: false };
  const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const totalRevenue = safeOrders
    .filter((o) => o?.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number.isFinite(Number(o?.total)) ? Number(o.total) : 0), 0);
  const totalOrders = safeOrders.length;
  const netProfit = totalRevenue * 0.35;
  const totalCustomers = new Set(safeOrders.map((o) => o?.phone).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-champagne-50 flex">
      {/* Sidebar */}
      <aside className="w-20 sm:w-64 bg-burgundy-700 text-champagne-200 min-h-screen fixed left-0 top-0 bottom-0 flex flex-col z-40">
        <div className="p-3 sm:p-6 border-b border-champagne-400/10">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm sm:text-xl font-bold text-champagne-200">EVOLVE</span>
            <span className="hidden sm:inline font-serif text-xl font-light text-champagne-400">Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-2 sm:p-4 space-y-2 sm:space-y-1">
          {[
            { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
            { id: 'products' as const, label: 'Products', icon: Package },
            { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
            { id: 'coupons' as const, label: 'Coupons', icon: Tag },
            { id: 'settings' as const, label: 'Store Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'w-full flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-4 py-4 sm:py-3 rounded-md text-sm font-medium uppercase tracking-wider transition-colors',
                tab === item.id
                  ? 'bg-champagne-400 text-burgundy-700'
                  : 'text-champagne-200/70 hover:bg-burgundy-600 hover:text-champagne-200'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" /> <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-champagne-400/10 flex flex-col gap-3">
          <Link href="/" className="text-champagne-200/70 hover:text-champagne-200 text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" /> View Store
          </Link>
          <button
            type="button"
            onClick={() => void signOut().then(() => router.replace('/admin/login'))}
            className="text-champagne-200/70 hover:text-champagne-200 text-sm flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-20 sm:ml-64 p-4 pb-24 sm:pb-8 sm:p-8 min-w-0 overflow-x-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-burgundy-700" />
          </div>
        ) : (
          <>
            {loadError && <p role="status" className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError} Showing safe defaults.</p>}
            {tab === 'overview' && (
              <OverviewTab
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                netProfit={netProfit}
                totalCustomers={totalCustomers}
                orders={safeOrders}
                products={safeProducts}
              />
            )}
            {tab === 'products' && (
              <ProductsTab products={safeProducts} categories={Array.isArray(categories) ? categories.filter(Boolean) : []} setProducts={setProducts} />
            )}
            {tab === 'orders' && <OrdersTab orders={safeOrders} setOrders={setOrders} />}
            {tab === 'coupons' && <CouponsTab coupons={coupons} setCoupons={setCoupons} />}
            {tab === 'settings' && <SettingsTab settings={settings ?? defaultStoreSettings} onSaved={setSettings} />}
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminErrorBoundary>
      <AdminDashboard />
    </AdminErrorBoundary>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="bg-champagne-100 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="bg-burgundy-700/10 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-burgundy-700" />
        </div>
        {trend && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-serif font-bold text-burgundy-700">{value}</p>
      <p className="text-sm text-burgundy/50 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function OverviewTab({
  totalRevenue,
  totalOrders,
  netProfit,
  totalCustomers,
  orders,
  products,
}: {
  totalRevenue: number;
  totalOrders: number;
  netProfit: number;
  totalCustomers: number;
  orders: Order[];
  products: Product[];
}) {
  const topProducts = products
    .map((p) => ({
      name: p.name,
      sales: orders
        .flatMap((o) => o.order_items || [])
        .filter((i) => i.product_id === p.id)
        .reduce((sum, i) => sum + i.quantity, 0),
      revenue: orders
        .flatMap((o) => o.order_items || [])
        .filter((i) => i.product_id === p.id)
        .reduce((sum, i) => sum + Number(i.unit_price) * i.quantity, 0),
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const statusCounts = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
    (status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    })
  );

  return (
    <div>
      <h1 className="font-serif text-3xl text-burgundy-700 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(totalRevenue)} trend="+12%" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={String(totalOrders)} trend="+8%" />
        <StatCard icon={TrendingUp} label="Net Profit" value={formatPrice(netProfit)} trend="+15%" />
        <StatCard icon={Users} label="Customers" value={String(totalCustomers)} trend="+5%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-champagne-100 rounded-lg p-6">
          <h2 className="font-serif text-xl text-burgundy-700 mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-burgundy/40 font-serif text-lg">{idx + 1}</span>
                  <span className="text-burgundy-700">{p.name}</span>
                </div>
              <div className="text-left sm:text-right">
                  <p className="text-burgundy-700 font-medium">{p.sales} sold</p>
                  <p className="text-burgundy/50 text-xs">{formatPrice(p.revenue)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-burgundy/40 text-sm">No sales data yet.</p>
            )}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-champagne-100 rounded-lg p-6">
          <h2 className="font-serif text-xl text-burgundy-700 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {statusCounts.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="text-burgundy/70 capitalize">{s.status}</span>
                <span className="font-medium text-burgundy-700">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({
  products,
  categories,
  setProducts,
}: {
  products: Product[];
  categories: Category[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (product: Product) => {
    const legacyProduct = product as Product & { _id?: string };
    const firestoreId = product?.id || legacyProduct._id;
    const localKey = firestoreId || product?.slug || product?.name;
    if (!confirm('Delete this product?')) return;
    if (!firestoreId) {
      setProducts((current) => current.filter((item) => {
        const itemLegacy = item as Product & { _id?: string };
        const itemKey = item?.id || itemLegacy._id || item?.slug || item?.name;
        return itemKey !== localKey;
      }));
      toast.success('Product removed from the dashboard');
      return;
    }
    try {
      await deleteDoc(doc(db, 'products', firestoreId));
      setProducts((current) => current.filter((p) => p?.id !== firestoreId));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-burgundy-700">Products</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="luxe-btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="hidden md:block bg-champagne-100 rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-burgundy-700/5">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-burgundy/70 uppercase tracking-wider">Product</th>
              <th className="text-left p-4 text-sm font-medium text-burgundy/70 uppercase tracking-wider">Category</th>
              <th className="text-left p-4 text-sm font-medium text-burgundy/70 uppercase tracking-wider">Price</th>
              <th className="text-left p-4 text-sm font-medium text-burgundy/70 uppercase tracking-wider">Stock</th>
              <th className="text-right p-4 text-sm font-medium text-burgundy/70 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-burgundy/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {Array.isArray(p?.images) && p.images[0] ? <img src={p.images[0]} alt={p.name || 'Product'} className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-burgundy/10" />}
                    <span className="text-burgundy-700 font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-burgundy/60 text-sm">{p.category?.name || '—'}</td>
                <td className="p-4 text-burgundy-700 font-medium">{formatPrice(p.price)}</td>
                <td className="p-4">
                  <span className={cn(
                    'text-sm font-medium',
                    p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                    className="p-2 text-burgundy/60 hover:text-burgundy-700 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="p-2 text-burgundy/60 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {products.map((p) => {
          const image = Array.isArray(p?.images) ? p.images[0] : '';
          return <div key={p?.id || p?.slug} className="bg-champagne-100 rounded-lg p-4 flex gap-3">
            {image ? <img src={image} alt={p?.name || 'Product'} className="h-16 w-16 rounded object-cover shrink-0" /> : <div className="h-16 w-16 rounded bg-burgundy/10 shrink-0" />}
            <div className="min-w-0 flex-1"><p className="font-medium text-burgundy-700 truncate">{p?.name || 'Untitled product'}</p><p className="text-sm text-burgundy/60">{formatPrice(Number(p?.price) || 0)} · Stock {Number(p?.stock) || 0}</p><p className="text-xs text-burgundy/50">{p?.category?.name || 'Uncategorized'}</p></div>
            <div className="flex items-center gap-1"><button type="button" aria-label="Edit product" onClick={() => { setEditing(p); setShowForm(true); }} className="min-h-11 min-w-11 p-3 text-burgundy/70"><Pencil className="h-5 w-5" /></button><button type="button" aria-label="Delete product" onClick={() => handleDelete(p)} className="min-h-11 min-w-11 p-3 text-red-600"><Trash2 className="h-5 w-5" /></button></div>
          </div>;
        })}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSave={(saved) => {
            if (editing) {
              setProducts(products.map((p) => (p.id === saved.id ? saved : p)));
            } else {
              setProducts([saved, ...products]);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || 0,
    original_price: product?.original_price || 0,
    category_id: product?.category_id || categories[0]?.id || '',
    images: Array.isArray(product?.images) ? product?.images.join('\n') : '',
    video_url: product?.video_url || '',
    stock: product?.stock || 0,
    is_featured: product?.is_featured || false,
    is_on_sale: product?.is_on_sale || false,
  });
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const initialImages = product?.images;
  const [imageUrls, setImageUrls] = useState<string[]>(Array.isArray(initialImages) ? initialImages : []);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setCompressing(true);
    try {
      const previews = await Promise.all(Array.from(files).map(compressImage));
      setImageUrls((current) => {
        const combined = Array.from(new Set([...current, ...previews]));
        let total = 0;
        const limited = combined.filter((image) => {
          const nextTotal = total + dataUrlBytes(image);
          if (nextTotal > MAX_IMAGES_BYTES) return false;
          total = nextTotal;
          return true;
        });
        if (limited.length < combined.length) toast.warning('Some images were skipped to keep the product under Firestore’s 800 KB limit.');
        return limited;
      });
      toast.success(`${previews.length} image${previews.length === 1 ? '' : 's'} compressed and ready`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to compress image');
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const typedImages = String(form.images || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const allImages = Array.from(new Set([...imageUrls, ...typedImages])).filter((image): image is string => typeof image === 'string' && image.length > 0);
    let imageBytes = 0;
    const images = allImages.filter((image) => {
      const nextBytes = imageBytes + dataUrlBytes(image);
      if (nextBytes > MAX_IMAGES_BYTES) return false;
      imageBytes = nextBytes;
      return true;
    });
    if (images.length < allImages.length) toast.warning('Some images were excluded to keep this product below Firestore’s 800 KB limit.');
    const name = String(form.name || '').trim();
    const slug = String(form.slug || name.toLowerCase().replace(/\s+/g, '-')).trim();
    const payload = {
      name,
      slug,
      description: String(form.description || ''),
      price: Number.isFinite(Number(form.price)) ? Number(form.price) : 0,
      original_price: Number(form.original_price) > 0 ? Number(form.original_price) : null,
      category_id: form.category_id ? String(form.category_id) : null,
      images,
      video_url: form.video_url ? String(form.video_url).trim() : null,
      stock: Number.isFinite(Number(form.stock)) ? Number(form.stock) : 0,
      is_featured: form.is_featured,
      is_on_sale: form.is_on_sale,
      rating: product?.rating || 0,
      review_count: product?.review_count || 0,
      tags: product?.tags || [],
      updated_at: serverTimestamp(),
    };

    try {
      let savedProduct: Product;
      if (product?.id) {
        await updateDoc(doc(db, 'products', product.id), payload);
        const cat = categories.find((c) => c.id === form.category_id);
        savedProduct = { ...product, ...payload, updated_at: new Date().toISOString(), category: cat } as Product;
      } else {
        const ref = await addDoc(collection(db, 'products'), {
          ...payload,
          created_at: serverTimestamp(),
        });
        const cat = categories.find((c) => c.id === form.category_id);
        savedProduct = {
          id: ref.id,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: cat,
        } as unknown as Product;
      }
      toast.success(product ? 'Product updated' : 'Product created');
      onSave(savedProduct);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-burgundy-900/60 backdrop-blur z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-champagne-50 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-burgundy-700">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-burgundy/60 hover:text-burgundy-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="luxe-label">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="luxe-input" />
            </div>
            <div>
              <label className="luxe-label">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="luxe-input" placeholder="auto-generated" />
            </div>
            <div className="md:col-span-2">
              <label className="luxe-label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="luxe-input min-h-[80px]" />
            </div>
            <div>
              <label className="luxe-label">Price (DZD) *</label>
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="luxe-input" />
            </div>
            <div>
              <label className="luxe-label">Original Price</label>
              <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} className="luxe-input" />
            </div>
            <div>
              <label className="luxe-label">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="luxe-input">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="luxe-label">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="luxe-input" />
            </div>
          <div className="md:col-span-2">
            <label className="luxe-label">Product Images</label>
            <input disabled={compressing || saving} type="file" accept="image/*" multiple onChange={(e) => void handleFiles(e.target.files)} className="luxe-input file:mr-3 file:border-0 file:bg-burgundy-700 file:px-3 file:py-2 file:text-champagne-50" />
            {compressing && <p role="status" className="mt-2 text-sm font-medium text-burgundy-700">Compressing images...</p>}
            <p className="mt-1 text-xs text-burgundy/55">Each image is compressed below 95 KB; the full gallery is capped at 800 KB.</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                {imageUrls.map((image, index) => (
                  <div key={`${image.slice(0, 20)}-${index}`} className="relative aspect-square rounded overflow-hidden bg-burgundy/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => setImageUrls(imageUrls.filter((_, imageIndex) => imageIndex !== index))} className="absolute top-1 right-1 rounded-full bg-burgundy-700 text-champagne-50 p-1"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <label className="luxe-label mt-4">Image URLs (one per line)</label>
              <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="luxe-input min-h-[80px]" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="luxe-label">Video URL</label>
              <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="luxe-input" />
            </div>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-burgundy/70">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-burgundy/70">
                <input type="checkbox" checked={form.is_on_sale} onChange={(e) => setForm({ ...form, is_on_sale: e.target.checked })} />
                On Sale
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="luxe-btn-primary flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {product ? 'Save Product' : 'Publish Product'}
            </button>
            <button type="button" onClick={onClose} className="luxe-btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrdersTab({ orders, setOrders }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    if (!orderId || orderId === 'unknown') {
      toast.error('This order is missing its Firestore ID.');
      return;
    }
    const { error } = await updateOrderStatus(orderId, status);
    if (error) {
      toast.error(error);
      return;
    }
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    toast.success('Order status updated');
  };

  const handleCancel = (orderId: string) => handleStatusChange(orderId, 'cancelled');

  return (
    <div>
      <h1 className="font-serif text-3xl text-burgundy-700 mb-8">Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const safeOrder = order ?? ({} as Order);
          const orderId = safeOrder.id || 'unknown';
          const orderItems = Array.isArray(safeOrder.order_items) ? safeOrder.order_items.filter(Boolean) : [];
          return (
          <div key={orderId} className="bg-champagne-100 rounded-lg p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-serif text-lg text-burgundy-700">Order #{orderId.slice(0, 8)}</p>
                <p className="text-sm text-burgundy/50">
                  {safeOrder.created_at ? new Date(safeOrder.created_at).toLocaleString() : 'N/A'}
                </p>
                <p className="text-sm text-burgundy/70 mt-1">
                  {safeOrder.full_name || 'N/A'} · {safeOrder.phone || 'N/A'} · {safeOrder.wilaya || 'N/A'}
                </p>
                <p className="text-sm text-burgundy/50">{safeOrder.address || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-xl text-burgundy-700">{formatPrice(Number(safeOrder.total) || 0)}</p>
                {Number(safeOrder.discount) > 0 && (
                  <p className="text-xs text-green-600">Saved {formatPrice(Number(safeOrder.discount) || 0)}</p>
                )}
                <p className="text-xs text-burgundy/50">
                  {Number(safeOrder.loyalty_points_earned) || 0} points earned
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {orderItems.map((item) => (
                <div key={item?.id || `${orderId}-${item?.product_id || 'item'}`} className="flex items-center gap-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {item?.product_image && (
                    <img src={item.product_image} alt={item.product_name || 'Product'} className="h-10 w-10 rounded object-cover" />
                  )}
                  <span className="text-burgundy/70">{item?.product_name || 'Product'}</span>
                  <span className="text-burgundy/50">× {Number(item?.quantity) || 0}</span>
                  <span className="text-burgundy-700 font-medium ml-auto">{formatPrice((Number(item?.unit_price) || 0) * (Number(item?.quantity) || 0))}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-burgundy/10">
              <span className="text-sm text-burgundy/60 uppercase tracking-wider">Status:</span>
              <select
                value={safeOrder.status || 'pending'}
                onChange={(e) => handleStatusChange(orderId, e.target.value as Order['status'])}
                className={cn(
                  'min-h-11 text-sm font-medium px-3 py-2 rounded-md border-2 cursor-pointer',
                  safeOrder.status === 'delivered'
                    ? 'border-green-600 text-green-700 bg-green-50'
                    : safeOrder.status === 'cancelled'
                    ? 'border-red-600 text-red-700 bg-red-50'
                    : 'border-burgundy/20 text-burgundy-700'
                )}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {safeOrder.status !== 'cancelled' && <button type="button" onClick={() => handleCancel(orderId)} className="min-h-11 px-4 py-2 rounded-md text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50">Cancel order</button>}
            </div>
          </div>
          );
        })}
        {orders.length === 0 && (
          <p className="text-center text-burgundy/50 py-20">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

function CouponsTab({ coupons, setCoupons }: { coupons: Coupon[]; setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    min_order: 0,
    max_uses: 100,
    expires_at: '',
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'coupons'), {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        min_order: Number(form.min_order),
        max_uses: Number(form.max_uses),
        used_count: 0,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: true,
        created_at: serverTimestamp(),
      });
      const newCoupon: Coupon = {
        id: ref.id,
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        min_order: Number(form.min_order),
        max_uses: Number(form.max_uses),
        used_count: 0,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setCoupons([newCoupon, ...coupons]);
      toast.success('Coupon created');
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: 10, min_order: 0, max_uses: 100, expires_at: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    const id = coupon?.id || coupon?.code;
    const nextActive = !Boolean(coupon?.is_active);
    setCoupons((current) => current.map((item) => ((item.id || item.code) === id ? { ...item, is_active: nextActive } : item)));
    if (!id) return;
    try {
      await updateDoc(doc(db, 'coupons', id), { is_active: nextActive });
      toast.success('Coupon updated');
    } catch (err) {
      toast.warning('Coupon updated locally; Firestore record could not be updated.');
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    const id = coupon?.id || coupon?.code;
    if (!confirm('Delete this coupon?')) return;
    setCoupons((current) => current.filter((item) => (item.id || item.code) !== id));
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.warning('Coupon removed locally; Firestore record could not be deleted.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-burgundy-700">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="luxe-btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id || c.code} className="bg-champagne-100 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-serif text-xl text-burgundy-700">{c.code}</p>
                <p className="text-sm text-burgundy/50">
                  {c.type === 'percentage' ? `${c.value}% off` : `${formatPrice(c.value)} off`}
                </p>
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-1 text-sm text-burgundy/60 mb-4">
              <p>Min order: {formatPrice(c.min_order)}</p>
              <p>Used: {c.used_count} / {c.max_uses}</p>
              {c.expires_at && <p>Expires: {new Date(c.expires_at).toLocaleDateString()}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(c)}
                className="text-xs px-3 py-1.5 rounded bg-burgundy-700/10 text-burgundy-700 hover:bg-burgundy-700/20 transition-colors"
              >
                {c.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(c)}
                className="text-xs px-3 py-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-burgundy-900/60 backdrop-blur z-[100] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-champagne-50 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-burgundy-700">Add Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-burgundy/60 hover:text-burgundy-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="luxe-label">Code *</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="luxe-input uppercase" placeholder="SUMMER15" />
              </div>
              <div>
                <label className="luxe-label">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })} className="luxe-input">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="luxe-label">Value *</label>
                <input required type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="luxe-input" />
              </div>
              <div>
                <label className="luxe-label">Min Order (DZD)</label>
                <input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} className="luxe-input" />
              </div>
              <div>
                <label className="luxe-label">Max Uses</label>
                <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} className="luxe-input" />
              </div>
              <div>
                <label className="luxe-label">Expiry Date</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="luxe-input" />
              </div>
              <button type="submit" disabled={saving} className="w-full luxe-btn-primary flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
