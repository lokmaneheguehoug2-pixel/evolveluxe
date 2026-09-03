import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Category, Coupon, Order, Review, OrderInput } from '@/lib/types';

function snapToCategory(d: DocumentData): Category {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description ?? null,
    image_url: d.image_url ?? null,
    created_at: d.created_at instanceof Timestamp ? d.created_at.toDate().toISOString() : d.created_at ?? new Date().toISOString(),
  };
}

function snapToProduct(d: DocumentData, category?: Category): Product {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description ?? null,
    price: Number(d.price ?? 0),
    original_price: d.original_price != null ? Number(d.original_price) : null,
    category_id: d.category_id ?? null,
    images: d.images ?? [],
    video_url: d.video_url ?? null,
    stock: Number(d.stock ?? 0),
    is_featured: d.is_featured ?? false,
    is_on_sale: d.is_on_sale ?? false,
    rating: Number(d.rating ?? 0),
    review_count: Number(d.review_count ?? 0),
    tags: d.tags ?? [],
    created_at: d.created_at instanceof Timestamp ? d.created_at.toDate().toISOString() : d.created_at ?? new Date().toISOString(),
    updated_at: d.updated_at instanceof Timestamp ? d.updated_at.toDate().toISOString() : d.updated_at ?? new Date().toISOString(),
    category,
  };
}

function snapToCoupon(d: DocumentData): Coupon {
  return {
    id: d.id,
    code: d.code,
    type: d.type,
    value: Number(d.value),
    min_order: Number(d.min_order ?? 0),
    max_uses: Number(d.max_uses ?? 100),
    used_count: Number(d.used_count ?? 0),
    expires_at: d.expires_at instanceof Timestamp ? d.expires_at.toDate().toISOString() : d.expires_at ?? null,
    is_active: d.is_active ?? true,
    created_at: d.created_at instanceof Timestamp ? d.created_at.toDate().toISOString() : d.created_at ?? new Date().toISOString(),
  };
}

function snapToOrder(d: DocumentData, items?: Order['order_items']): Order {
  return {
    id: d.id,
    user_id: d.user_id ?? null,
    full_name: d.full_name,
    phone: d.phone,
    wilaya: d.wilaya,
    address: d.address,
    status: d.status ?? 'pending',
    subtotal: Number(d.subtotal ?? 0),
    discount: Number(d.discount ?? 0),
    total: Number(d.total ?? 0),
    coupon_code: d.coupon_code ?? null,
    loyalty_points_earned: Number(d.loyalty_points_earned ?? 0),
    notes: d.notes ?? null,
    created_at: d.created_at instanceof Timestamp ? d.created_at.toDate().toISOString() : d.created_at ?? new Date().toISOString(),
    updated_at: d.updated_at instanceof Timestamp ? d.updated_at.toDate().toISOString() : d.updated_at ?? new Date().toISOString(),
    order_items: items,
  };
}

function snapToReview(d: DocumentData): Review {
  return {
    id: d.id,
    product_id: d.product_id,
    author_name: d.author_name,
    rating: Number(d.rating),
    comment: d.comment ?? null,
    is_verified: d.is_verified ?? false,
    created_at: d.created_at instanceof Timestamp ? d.created_at.toDate().toISOString() : d.created_at ?? new Date().toISOString(),
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('name'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => snapToCategory(d.data()));
  } catch {
    return [];
  }
}

export async function getProducts(opts?: {
  category?: string;
  featured?: boolean;
  onSale?: boolean;
  limit?: number;
  search?: string;
}): Promise<Product[]> {
  try {
    const constraints: ReturnType<typeof where>[] = [];
    if (opts?.category) {
      const cats = await getCategories();
      const cat = cats.find((c) => c.slug === opts.category);
      if (cat) constraints.push(where('category_id', '==', cat.id));
    }
    if (opts?.featured) constraints.push(where('is_featured', '==', true));
    if (opts?.onSale) constraints.push(where('is_on_sale', '==', true));

    let q;
    if (constraints.length > 0) {
      q = query(collection(db, 'products'), ...constraints, fbLimit(opts?.limit ?? 200));
    } else {
      q = query(collection(db, 'products'), fbLimit(opts?.limit ?? 200));
    }

    const snap = await getDocs(q);
    let products = snap.docs.map((d) => snapToProduct(d.data()));

    // Fetch categories for each product
    const cats = await getCategories();
    const catMap = new Map(cats.map((c) => [c.id, c]));
    products = products.map((p) => ({
      ...p,
      category: p.category_id ? catMap.get(p.category_id) : undefined,
    }));

    // Client-side search filtering (Firestore doesn't support full-text search)
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.description?.toLowerCase().includes(s) ?? false) ||
          p.tags.some((t) => t.toLowerCase().includes(s))
      );
    }

    // Sort by created_at descending (newest first)
    products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (opts?.limit) products = products.slice(0, opts.limit);
    return products;
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), fbLimit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const data = snap.docs[0].data();
    const product = snapToProduct(data);

    // Fetch category
    if (product.category_id) {
      const cats = await getCategories();
      product.category = cats.find((c) => c.id === product.category_id);
    }

    // Fetch variants
    try {
      const vSnap = await getDocs(
        query(collection(db, 'product_variants'), where('product_id', '==', product.id))
      );
      product.variants = vSnap.docs.map((d) => ({
        id: d.id,
        product_id: d.data().product_id,
        color: d.data().color ?? null,
        size: d.data().size ?? null,
        stock: Number(d.data().stock ?? 0),
        price_modifier: Number(d.data().price_modifier ?? 0),
        created_at: d.data().created_at instanceof Timestamp ? d.data().created_at.toDate().toISOString() : new Date().toISOString(),
      }));
    } catch {
      // variants collection may not exist yet
    }

    // Fetch reviews
    try {
      const rSnap = await getDocs(
        query(collection(db, 'reviews'), where('product_id', '==', product.id), orderBy('created_at', 'desc'))
      );
      product.reviews = rSnap.docs.map((d) => snapToReview(d.data()));
    } catch {
      // reviews collection may not exist yet
    }

    return product;
  } catch {
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const ref = doc(db, 'products', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const product = snapToProduct(snap.data());
    if (product.category_id) {
      const cats = await getCategories();
      product.category = cats.find((c) => c.id === product.category_id);
    }
    return product;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limitCount = 4
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, 'products'),
      where('category_id', '==', categoryId),
      fbLimit(limitCount + 1)
    );
    const snap = await getDocs(q);
    let products = snap.docs.map((d) => snapToProduct(d.data()));
    products = products.filter((p) => p.id !== excludeId).slice(0, limitCount);

    const cats = await getCategories();
    const catMap = new Map(cats.map((c) => [c.id, c]));
    products = products.map((p) => ({
      ...p,
      category: p.category_id ? catMap.get(p.category_id) : undefined,
    }));
    return products;
  } catch {
    return [];
  }
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; error?: string }> {
  try {
    const q = query(
      collection(db, 'coupons'),
      where('code', '==', code.toUpperCase()),
      where('is_active', '==', true),
      fbLimit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { valid: false, error: 'Invalid coupon code' };

    const coupon = snapToCoupon(snap.docs[0].data());
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, error: 'This coupon has expired' };
    }
    if (coupon.used_count >= coupon.max_uses) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }
    if (subtotal < coupon.min_order) {
      return {
        valid: false,
        error: `Minimum order of ${coupon.min_order} DZD required for this coupon`,
      };
    }
    const discount =
      coupon.type === 'percentage'
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    return { valid: true, coupon, discount: Math.min(discount, subtotal) };
  } catch {
    return { valid: false, error: 'Unable to validate coupon. Please try again.' };
  }
}

export async function createOrder(orderData: OrderInput): Promise<{ order: Order | null; error: string | null }> {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      full_name: orderData.full_name,
      phone: orderData.phone,
      wilaya: orderData.wilaya,
      address: orderData.address,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      total: orderData.total,
      coupon_code: orderData.coupon_code || null,
      loyalty_points_earned: orderData.loyalty_points_earned,
      notes: orderData.notes || null,
      status: 'pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Add order items as subcollection
    for (const item of orderData.items) {
      await addDoc(collection(db, 'orders', orderRef.id, 'order_items'), {
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant_color: item.variant_color || null,
        variant_size: item.variant_size || null,
        created_at: serverTimestamp(),
      });
    }

    // Increment coupon usage
    if (orderData.coupon_code) {
      try {
        const cSnap = await getDocs(
          query(collection(db, 'coupons'), where('code', '==', orderData.coupon_code.toUpperCase()), fbLimit(1))
        );
        if (!cSnap.empty) {
          const couponRef = doc(db, 'coupons', cSnap.docs[0].id);
          await updateDoc(couponRef, {
            used_count: (cSnap.docs[0].data().used_count ?? 0) + 1,
          });
        }
      } catch {
        // non-critical
      }
    }

    const newOrder: Order = {
      id: orderRef.id,
      user_id: null,
      full_name: orderData.full_name,
      phone: orderData.phone,
      wilaya: orderData.wilaya,
      address: orderData.address,
      status: 'pending',
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      total: orderData.total,
      coupon_code: orderData.coupon_code || null,
      loyalty_points_earned: orderData.loyalty_points_earned,
      notes: orderData.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { order: newOrder, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create order';
    return { order: null, error: msg };
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const orders: Order[] = [];
    for (const orderDoc of snap.docs) {
      const data = orderDoc.data();
      let items: Order['order_items'] = [];
      try {
        const itemsSnap = await getDocs(collection(db, 'orders', orderDoc.id, 'order_items'));
        items = itemsSnap.docs.map((d) => ({
          id: d.id,
          order_id: orderDoc.id,
          product_id: d.data().product_id ?? null,
          product_name: d.data().product_name,
          product_image: d.data().product_image ?? null,
          quantity: Number(d.data().quantity ?? 1),
          unit_price: Number(d.data().unit_price ?? 0),
          variant_color: d.data().variant_color ?? null,
          variant_size: d.data().variant_size ?? null,
          created_at: d.data().created_at instanceof Timestamp ? d.data().created_at.toDate().toISOString() : new Date().toISOString(),
        }));
      } catch {
        // items subcollection may not exist
      }
      orders.push(snapToOrder(data, items));
    }
    // Sort by created_at descending
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return orders;
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<{ error: string | null }> {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updated_at: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update order' };
  }
}

export async function getReviews(productId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('product_id', '==', productId),
      orderBy('created_at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => snapToReview(d.data()));
  } catch {
    return [];
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const snap = await getDocs(collection(db, 'coupons'));
    const coupons = snap.docs.map((d) => snapToCoupon(d.data()));
    coupons.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return coupons;
  } catch {
    return [];
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' DZD';
}

export function calculateLoyaltyPoints(total: number): number {
  return Math.floor(total / 100);
}

export function getDiscountPercent(price: number, original: number): number {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}
