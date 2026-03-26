export type UserRole = 'admin' | 'manager' | 'user';

export interface UserProfile {
  uid: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt?: any;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export type ProductCategory = 'Men' | 'Women' | 'Kids' | 'Accessories';

export type ClothingType =
  | 'Saree' | 'Kurta' | 'Lehenga' | 'Salwar Kameez' | 'Dhoti' | 'Sherwani'
  | 'Blouse' | 'Dupatta' | 'Palazzo' | 'Churidar' | 'Anarkali' | 'Kurti'
  | 'Shirt' | 'Trouser' | 'Jacket' | 'Stole' | 'Other';

export type FabricType =
  | 'Silk' | 'Cotton' | 'Linen' | 'Chiffon' | 'Georgette' | 'Velvet'
  | 'Satin' | 'Crepe' | 'Net' | 'Organza' | 'Rayon' | 'Polyester'
  | 'Wool' | 'Jute' | 'Khadi' | 'Banarasi' | 'Chanderi' | 'Other';

export type OccasionType =
  | 'Casual' | 'Festive' | 'Wedding' | 'Party' | 'Office' | 'Bridal'
  | 'Daily Wear' | 'Traditional' | 'Ceremonial' | 'Other';

export interface ProductVariant {
  color: string;
  colorHex: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  image: string;
  images?: string[];
  sizes: string[];
  variants?: ProductVariant[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  stock: number;
  sku?: string;
  tags?: string[];
  averageRating?: number;
  reviewCount?: number;
  createdAt?: any;

  // Clothing-specific metadata
  clothingType?: ClothingType;
  fabric?: FabricType;
  occasion?: OccasionType;
  color?: string;
  pattern?: string;       // e.g. 'Floral', 'Solid', 'Printed', 'Embroidered', 'Striped'
  weight?: string;        // e.g. '350g', 'Lightweight'
  careInstructions?: string;  // e.g. 'Dry Clean Only'
  countryOfOrigin?: string;
  brand?: string;
  styleCode?: string;
  length?: string;        // e.g. 'Knee Length', 'Floor Length', '2.5m'
  work?: string;          // e.g. 'Zari', 'Embroidery', 'Sequin', 'Mirror Work'
  transparency?: string;  // e.g. 'Opaque', 'Sheer', 'Semi-Sheer'
  isPublished?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedVariant?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  variant?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  trackingId?: string;
  couponCode?: string;
  note?: string;
  createdAt: any;
  updatedAt: any;
  deliveredAt?: any;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt: any;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: any;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: any;
  validUntil: any;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  image: string;
  mobileImage?: string;
  title: string;
  subtitle?: string;
  link?: string;
  isActive: boolean;
  order: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: any;
}
