export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  images: string[];
  video_url: string | null;
  stock: number;
  is_featured: boolean;
  is_on_sale: boolean;
  rating: number;
  review_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
  reviews?: Review[];
};

export type ProductVariant = {
  id: string;
  product_id: string;
  color: string | null;
  size: string | null;
  stock: number;
  price_modifier: number;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  wilaya: string;
  address: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  loyalty_points_earned: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  variant_color: string | null;
  variant_size: string | null;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  variantColor?: string;
  variantSize?: string;
  stock: number;
};

export type OrderInputItem = {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  variant_color?: string;
  variant_size?: string;
};

export type OrderInput = {
  full_name: string;
  phone: string;
  wilaya: string;
  address: string;
  items: OrderInputItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string;
  loyalty_points_earned: number;
  notes?: string;
};
