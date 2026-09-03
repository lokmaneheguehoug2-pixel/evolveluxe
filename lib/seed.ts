'use client';

import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const ADMIN_EMAIL = 'admin@evolveluxe.dz';
const ADMIN_PASSWORD = 'Lok12mane';

const CATEGORIES = [
  {
    name: 'Sunglasses',
    slug: 'sunglasses',
    description: 'Premium designer eyewear and sunglasses',
    image_url: 'https://images.pexels.com/photos/701840/pexels-photo-701840.jpeg',
  },
  {
    name: 'Leather Bags',
    slug: 'leather-bags',
    description: 'Handcrafted leather bags and briefcases',
    image_url: 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg',
  },
  {
    name: 'Wristwear',
    slug: 'wristwear',
    description: 'Luxury watches and wrist accessories',
    image_url: 'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Curated luxury accessories and essentials',
    image_url: 'https://images.pexels.com/photos/1152078/pexels-photo-1152078.jpeg',
  },
];

const PRODUCTS = [
  {
    name: 'Aviator Classic Gold',
    slug: 'aviator-classic-gold',
    description: 'Timeless aviator sunglasses with gold frame and gradient lenses. A statement of elegance.',
    price: 12500,
    original_price: 18000,
    category_slug: 'sunglasses',
    images: [
      'https://images.pexels.com/photos/701840/pexels-photo-701840.jpeg',
      'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg',
    ],
    stock: 25,
    is_featured: true,
    is_on_sale: true,
    rating: 4.8,
    review_count: 34,
    tags: ['sunglasses', 'aviator', 'gold', 'luxury'],
  },
  {
    name: 'Milano Leather Briefcase',
    slug: 'milano-leather-briefcase',
    description: 'Full-grain Italian leather briefcase with brass hardware. Handcrafted for the modern professional.',
    price: 32000,
    original_price: 45000,
    category_slug: 'leather-bags',
    images: [
      'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg',
      'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg',
    ],
    stock: 12,
    is_featured: true,
    is_on_sale: false,
    rating: 4.9,
    review_count: 21,
    tags: ['bag', 'leather', 'briefcase', 'professional'],
  },
  {
    name: 'Heritage Automatic Watch',
    slug: 'heritage-automatic-watch',
    description: 'Swiss automatic movement with sapphire crystal. A timeless piece for the discerning collector.',
    price: 58000,
    original_price: 75000,
    category_slug: 'wristwear',
    images: [
      'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg',
      'https://images.pexels.com/photos/364822/rio-de-janeiro-landscape.jpg',
    ],
    stock: 8,
    is_featured: true,
    is_on_sale: true,
    rating: 5.0,
    review_count: 15,
    tags: ['watch', 'automatic', 'swiss', 'luxury'],
  },
  {
    name: 'Cat-Eye Tortoise Shell',
    slug: 'cat-eye-tortoise-shell',
    description: 'Bold cat-eye frames in tortoise shell pattern. UV400 protection with polarized lenses.',
    price: 9800,
    original_price: null,
    category_slug: 'sunglasses',
    images: [
      'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg',
    ],
    stock: 30,
    is_featured: false,
    is_on_sale: false,
    rating: 4.5,
    review_count: 12,
    tags: ['sunglasses', 'cat-eye', 'tortoise', 'women'],
  },
  {
    name: 'Florence Tote Bag',
    slug: 'florence-tote-bag',
    description: 'Spacious leather tote in rich cognac brown. Perfect for everyday luxury.',
    price: 24000,
    original_price: 30000,
    category_slug: 'leather-bags',
    images: [
      'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg',
    ],
    stock: 18,
    is_featured: false,
    is_on_sale: true,
    rating: 4.7,
    review_count: 18,
    tags: ['bag', 'tote', 'leather', 'women'],
  },
  {
    name: 'Minimalist Silver Watch',
    slug: 'minimalist-silver-watch',
    description: 'Clean, minimalist design with stainless steel case and mesh band.',
    price: 18500,
    original_price: 22000,
    category_slug: 'wristwear',
    images: [
      'https://images.pexels.com/photos/364822/rio-de-janeiro-landscape.jpg',
    ],
    stock: 22,
    is_featured: false,
    is_on_sale: true,
    rating: 4.6,
    review_count: 9,
    tags: ['watch', 'silver', 'minimalist', 'mesh'],
  },
  {
    name: 'Silk Scarf Collection',
    slug: 'silk-scarf-collection',
    description: '100% pure silk scarves in exclusive EVOLVE LUXE patterns.',
    price: 7500,
    original_price: null,
    category_slug: 'accessories',
    images: [
      'https://images.pexels.com/photos/1152078/pexels-photo-1152078.jpeg',
    ],
    stock: 40,
    is_featured: true,
    is_on_sale: false,
    rating: 4.4,
    review_count: 7,
    tags: ['scarf', 'silk', 'accessory', 'pattern'],
  },
  {
    name: 'Leather Card Holder',
    slug: 'leather-card-holder',
    description: 'Slim, full-grain leather card holder with 6 card slots.',
    price: 4500,
    original_price: 6000,
    category_slug: 'accessories',
    images: [
      'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg',
    ],
    stock: 50,
    is_featured: false,
    is_on_sale: true,
    rating: 4.3,
    review_count: 5,
    tags: ['card-holder', 'leather', 'slim', 'accessory'],
  },
];

const COUPONS = [
  {
    code: 'EVOLVE10',
    type: 'percentage' as const,
    value: 10,
    min_order: 0,
    max_uses: 100,
    used_count: 0,
    is_active: true,
  },
  {
    code: 'LUXE20',
    type: 'percentage' as const,
    value: 20,
    min_order: 20000,
    max_uses: 50,
    used_count: 0,
    is_active: true,
  },
  {
    code: 'WELCOME500',
    type: 'fixed' as const,
    value: 500,
    min_order: 5000,
    max_uses: 100,
    used_count: 0,
    is_active: true,
  },
  {
    code: 'VIP2500',
    type: 'fixed' as const,
    value: 2500,
    min_order: 50000,
    max_uses: 20,
    used_count: 0,
    is_active: true,
  },
];

const REVIEWS = [
  {
    product_slug: 'aviator-classic-gold',
    author_name: 'Yacine B.',
    rating: 5,
    comment: 'Absolutely stunning quality. The gold frame is even better in person.',
    is_verified: true,
  },
  {
    product_slug: 'aviator-classic-gold',
    author_name: 'Lina K.',
    rating: 4,
    comment: 'Great sunglasses, but the case could be better.',
    is_verified: true,
  },
  {
    product_slug: 'milano-leather-briefcase',
    author_name: 'Karim A.',
    rating: 5,
    comment: 'The leather is incredible. Worth every dinar.',
    is_verified: true,
  },
  {
    product_slug: 'heritage-automatic-watch',
    author_name: 'Sofiane M.',
    rating: 5,
    comment: 'Swiss precision at its finest. A true heirloom piece.',
    is_verified: true,
  },
];

let seeding = false;

export async function seedDatabase(): Promise<void> {
  if (seeding) return;
  seeding = true;

  try {
    // 1. Seed categories
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of CATEGORIES) {
        const ref = doc(collection(db, 'categories'));
        await setDoc(ref, {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image_url: cat.image_url,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 2. Seed products
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      const cats = await getDocs(collection(db, 'categories'));
      const catMap = new Map<string, string>();
      cats.docs.forEach((d) => {
        catMap.set(d.data().slug, d.id);
      });

      for (const prod of PRODUCTS) {
        const ref = doc(collection(db, 'products'));
        await setDoc(ref, {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          original_price: prod.original_price,
          category_id: catMap.get(prod.category_slug) || null,
          images: prod.images,
          video_url: null,
          stock: prod.stock,
          is_featured: prod.is_featured,
          is_on_sale: prod.is_on_sale,
          rating: prod.rating,
          review_count: prod.review_count,
          tags: prod.tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    // 3. Seed coupons
    const couponSnap = await getDocs(collection(db, 'coupons'));
    if (couponSnap.empty) {
      for (const coupon of COUPONS) {
        const ref = doc(collection(db, 'coupons'));
        await setDoc(ref, {
          ...coupon,
          expires_at: null,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 4. Seed reviews
    const reviewSnap = await getDocs(collection(db, 'reviews'));
    if (reviewSnap.empty) {
      const prods = await getDocs(collection(db, 'products'));
      const prodMap = new Map<string, string>();
      prods.docs.forEach((d) => {
        prodMap.set(d.data().slug, d.id);
      });

      for (const review of REVIEWS) {
        const productId = prodMap.get(review.product_slug);
        if (productId) {
          const ref = doc(collection(db, 'reviews'));
          await setDoc(ref, {
            product_id: productId,
            author_name: review.author_name,
            rating: review.rating,
            comment: review.comment,
            is_verified: review.is_verified,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // 5. Ensure admin user exists in Firebase Auth + Firestore
    await ensureAdminUser();
  } catch {
    // Seeding is best-effort; failures should not block the app
  } finally {
    seeding = false;
  }
}

async function ensureAdminUser(): Promise<void> {
  try {
    // Try to create the admin auth account
    try {
      const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      await setDoc(doc(db, 'users', cred.user.uid), {
        full_name: 'Admin',
        email: ADMIN_EMAIL,
        role: 'admin',
        phone: '0781606765',
        created_at: new Date().toISOString(),
      });
    } catch {
      // If account already exists, ensure the Firestore profile has admin role
      try {
        const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        const profileRef = doc(db, 'users', cred.user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          if (profileSnap.data().role !== 'admin') {
            await setDoc(profileRef, { role: 'admin' }, { merge: true });
          }
        } else {
          await setDoc(profileRef, {
            full_name: 'Admin',
            email: ADMIN_EMAIL,
            role: 'admin',
            phone: '0781606765',
            created_at: new Date().toISOString(),
          });
        }
        // Sign back out so we don't leave the admin session active
        await auth.signOut();
      } catch {
        // Admin credentials may need to be created in Firebase Console first
      }
    }
  } catch {
    // non-critical
  }
}
