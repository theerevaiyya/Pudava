export type UserRole = 'admin' | 'manager' | 'user';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Men' | 'Women' | 'Kids';
  image: string;
  sizes: string[];
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: any; // Firestore timestamp
}
