import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  updateEmail,
  User,
  ConfirmationResult
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  increment,
  Timestamp
} from "firebase/firestore";
import { Product, UserRole, UserProfile, Address, Order, OrderItem, Review, WishlistItem, Coupon, Banner, HomePageImages, Notification as AppNotification, OrderStatus } from "../types";


const SYSTEM_ADMIN_EMAILS = ['latheeshk@gmail.com', 'latheeshkal202601@gmail.com'];

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


// ========================================
// IMAGE UPLOAD (AWS S3 via presigned URLs)
// ========================================

const UPLOAD_SECRET = import.meta.env.VITE_UPLOAD_API_SECRET || '';

export type UploadProgressCallback = (progress: number) => void;

export const uploadProductImage = async (
  file: File,
  productId: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const safeName = `${timestamp}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const key = `products/${productId}/${safeName}`;

  // 1. Get presigned URL from our server
  const presignRes = await fetch('/api/s3/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-upload-secret': UPLOAD_SECRET,
    },
    body: JSON.stringify({ key, contentType: file.type }),
  });

  if (!presignRes.ok) {
    throw new Error('Failed to get upload URL');
  }

  const { presignedUrl, publicUrl } = await presignRes.json();

  // 2. Upload directly to S3 using XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the S3 key from the public URL
    const url = new URL(imageUrl);
    const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

    await fetch('/api/s3/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-upload-secret': UPLOAD_SECRET,
      },
      body: JSON.stringify({ key }),
    });
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// ========================================
// PHONE AUTHENTICATION
// ========================================

let recaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
  return recaptchaVerifier;
};

export const sendOTP = async (phoneNumber: string, recaptcha: RecaptchaVerifier): Promise<ConfirmationResult> => {
  return signInWithPhoneNumber(auth, phoneNumber, recaptcha);
};

export const linkPhoneToAccount = async (user: User, verificationId: string, otp: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, otp);
  return linkWithCredential(user, credential);
};

// ========================================
// USER MANAGEMENT
// ========================================

export const getUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().role as UserRole;
    }
  } catch (error) {
    console.warn("Could not fetch user role. Defaulting to 'user'.", error);
  }
  return 'user';
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    }
  } catch (error) {
    console.warn("Could not fetch user profile.", error);
  }
  return null;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(d => ({
      uid: d.id,
      ...d.data()
    } as UserProfile));
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const createUserDocument = async (user: User, role: UserRole = 'user') => {
  if (!user) return;
  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      const { email, displayName, phoneNumber, photoURL } = user;
      const isSystemAdmin = email && SYSTEM_ADMIN_EMAILS.includes(email.toLowerCase());
      const finalRole = isSystemAdmin ? 'admin' : role;

      await setDoc(userRef, {
        displayName,
        email,
        phone: phoneNumber || null,
        photoURL: photoURL || null,
        role: finalRole,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn("Error creating user document:", error);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const updateUserRole = async (uid: string, role: UserRole) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const deleteUserDocument = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user document:", error);
    throw error;
  }
};

// ========================================
// PRODUCT MANAGEMENT
// ========================================

export const getProducts = async (): Promise<Product[]> => {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, 'products', id);
    const snap = await getDoc(productRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }
  return null;
};

export const getProductsByCategory = async (category: string, maxCount?: number): Promise<Product[]> => {
  const productsCol = collection(db, 'products');
  const constraints: any[] = [where('category', '==', category)];
  if (maxCount) constraints.push(limit(maxCount));
  const q = query(productsCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const getFeaturedProducts = async (maxCount?: number): Promise<Product[]> => {
  const productsCol = collection(db, 'products');
  const constraints: any[] = [where('isFeatured', '==', true)];
  if (maxCount) constraints.push(limit(maxCount));
  const q = query(productsCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const getNewArrivals = async (count = 8): Promise<Product[]> => {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, where('isNewArrival', '==', true), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const saveProduct = async (product: Partial<Product> & { id?: string }) => {
  // Strip undefined values — Firestore rejects them
  const clean = Object.fromEntries(Object.entries(product).filter(([_, v]) => v !== undefined));
  const productsCol = collection(db, 'products');
  if (clean.id) {
    const productRef = doc(db, 'products', clean.id as string);
    const { id, ...data } = clean;
    await updateDoc(productRef, data);
    return clean.id as string;
  } else {
    const docRef = await addDoc(productsCol, { ...clean, createdAt: serverTimestamp(), stock: (clean as any).stock ?? 0, averageRating: 0, reviewCount: 0 });
    return docRef.id;
  }
};

export const deleteProduct = async (id: string) => {
  const productRef = doc(db, 'products', id);
  await deleteDoc(productRef);
};

export const updateProductStock = async (productId: string, quantityChange: number) => {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, { stock: increment(quantityChange) });
};

// ========================================
// ADDRESS MANAGEMENT
// ========================================

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  const q = query(collection(db, 'addresses'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Address));
};

export const saveAddress = async (address: Omit<Address, 'id'> & { id?: string }): Promise<string> => {
  if (address.isDefault) {
    // Unset previous default
    const existing = await getUserAddresses(address.userId);
    const batch = writeBatch(db);
    existing.filter(a => a.isDefault && a.id !== address.id).forEach(a => {
      batch.update(doc(db, 'addresses', a.id), { isDefault: false });
    });
    await batch.commit();
  }

  if (address.id) {
    const ref = doc(db, 'addresses', address.id);
    const { id, ...data } = address;
    await updateDoc(ref, data);
    return address.id;
  } else {
    const docRef = await addDoc(collection(db, 'addresses'), address);
    return docRef.id;
  }
};

export const deleteAddress = async (id: string) => {
  await deleteDoc(doc(db, 'addresses', id));
};

// ========================================
// ORDER MANAGEMENT
// ========================================

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Strip undefined values — Firestore rejects them
  const clean = JSON.parse(JSON.stringify(orderData));
  const docRef = await addDoc(collection(db, 'orders'), {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Decrease stock for each item
  const batch = writeBatch(db);
  orderData.items.forEach(item => {
    const productRef = doc(db, 'products', item.productId);
    batch.update(productRef, { stock: increment(-item.quantity) });
  });
  await batch.commit();

  return docRef.id;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (snap.exists()) return { id: snap.id, ...snap.data() } as Order;
  return null;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus, trackingId?: string) => {
  const data: any = { status, updatedAt: serverTimestamp() };
  if (trackingId) data.trackingId = trackingId;
  if (status === 'delivered') {
    data.deliveredAt = serverTimestamp();
    // Auto-mark COD orders as paid upon delivery
    const orderSnap = await getDoc(doc(db, 'orders', orderId));
    if (orderSnap.exists() && orderSnap.data().paymentMethod === 'cod') {
      data.paymentStatus = 'paid';
    }
  }
  await updateDoc(doc(db, 'orders', orderId), data);
};

export const getAllOrders = async (): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

// ========================================
// WISHLIST MANAGEMENT
// ========================================

export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const q = query(collection(db, 'wishlist'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WishlistItem));
};

export const addToWishlist = async (userId: string, productId: string): Promise<string> => {
  // Check if already in wishlist
  const q = query(collection(db, 'wishlist'), where('userId', '==', userId), where('productId', '==', productId));
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;

  const docRef = await addDoc(collection(db, 'wishlist'), {
    userId,
    productId,
    addedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const q = query(collection(db, 'wishlist'), where('userId', '==', userId), where('productId', '==', productId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  const q = query(collection(db, 'wishlist'), where('userId', '==', userId), where('productId', '==', productId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// ========================================
// REVIEWS
// ========================================

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const q = query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review));
};

export const addReview = async (productId: string, reviewData: { userId: string; userName: string; rating: number; comment: string }): Promise<string> => {
  const review = { ...reviewData, productId };
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: serverTimestamp(),
  });

  // Update product average rating
  const reviews = await getProductReviews(productId);
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const newCount = reviews.length;
  await updateDoc(doc(db, 'products', productId), {
    averageRating: totalRating / newCount,
    reviewCount: newCount,
  });

  return docRef.id;
};

// ========================================
// COUPONS
// ========================================

export const validateCoupon = async (code: string, orderAmount: number): Promise<Coupon | null> => {
  const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Coupon;

  const now = new Date();
  const validFrom = coupon.validFrom?.toDate?.() || new Date(coupon.validFrom);
  const validUntil = coupon.validUntil?.toDate?.() || new Date(coupon.validUntil);

  if (now < validFrom || now > validUntil) return null;
  if (coupon.usedCount >= coupon.usageLimit) return null;
  if (orderAmount < coupon.minOrderAmount) return null;

  return coupon;
};

export const applyCoupon = async (couponId: string) => {
  await updateDoc(doc(db, 'coupons', couponId), { usedCount: increment(1) });
};

// ========================================
// BANNERS
// ========================================

export const getActiveBanners = async (): Promise<Banner[]> => {
  const q = query(collection(db, 'banners'), where('isActive', '==', true), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
};

// ========================================
// HOMEPAGE IMAGES
// ========================================

const DEFAULT_HOME_IMAGES: HomePageImages = {
  hero: 'https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=1920&auto=format&fit=crop',
  categoryWomen: 'https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=1200',
  categoryMen: 'https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800',
  categoryKids: 'https://images.unsplash.com/photo-1627885732159-4c8d28cb1745?q=80&w=800',
  fabricHeritage: 'https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=1000&auto=format&fit=crop',
  fabricKanchipuram: 'https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=600&auto=format&fit=crop',
  fabricBanarasi: 'https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=600&auto=format&fit=crop',
  fabricChanderi: 'https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=600&auto=format&fit=crop',
  fabricPatola: 'https://images.unsplash.com/photo-1627885732159-4c8d28cb1745?q=80&w=600&auto=format&fit=crop',
  fabricTussar: 'https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=600&auto=format&fit=crop',
  fabricMaheshwari: 'https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=600&auto=format&fit=crop',
};

export const getHomePageImages = async (): Promise<HomePageImages> => {
  const snap = await getDoc(doc(db, 'settings', 'homepage'));
  if (snap.exists()) {
    return { ...DEFAULT_HOME_IMAGES, ...snap.data() } as HomePageImages;
  }
  return DEFAULT_HOME_IMAGES;
};

export const saveHomePageImages = async (images: Partial<HomePageImages>): Promise<void> => {
  await setDoc(doc(db, 'settings', 'homepage'), images, { merge: true });
};

export const uploadHomeImage = async (
  file: File,
  slot: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const safeName = `${timestamp}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const key = `homepage/${slot}/${safeName}`;

  const presignRes = await fetch('/api/s3/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-upload-secret': UPLOAD_SECRET,
    },
    body: JSON.stringify({ key, contentType: file.type }),
  });

  if (!presignRes.ok) throw new Error('Failed to get upload URL');
  const { presignedUrl, publicUrl } = await presignRes.json();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100);
    };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(publicUrl) : reject(new Error(`Upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(file);
  });
};

// ========================================
// NOTIFICATIONS
// ========================================

export const getUserNotifications = async (userId: string): Promise<AppNotification[]> => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
};

export const markNotificationRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
};

export const createNotification = async (notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
  await addDoc(collection(db, 'notifications'), {
    ...notification,
    createdAt: serverTimestamp(),
  });
};

// ========================================
// RE-EXPORTS
// ========================================

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  PhoneAuthProvider,
  updateEmail,
  serverTimestamp
};

export type { ConfirmationResult };

// ========================================
// SEED DATA
// ========================================

const SAMPLE_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: "Midnight Silk Saree",
    description: "Handwoven pure silk saree in deep midnight blue with gold zari border. A timeless piece that reflects centuries of Indian craftsmanship.",
    price: 12000,
    originalPrice: 15000,
    category: "Women",
    image: "https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=800&auto=format&fit=crop"
    ],
    sizes: ["Free Size"],
    isBestSeller: true,
    isNewArrival: false,
    isFeatured: true,
    stock: 25,
    tags: ["silk", "saree", "premium", "wedding"],
    averageRating: 4.5,
    reviewCount: 12,
  },
  {
    name: "Classic Linen Kurta",
    description: "Breathable linen kurta in beige, perfect for summer gatherings. Minimalist design meets maximum comfort.",
    price: 2500,
    originalPrice: 3200,
    category: "Men",
    image: "https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800&auto=format&fit=crop"
    ],
    sizes: ["S", "M", "L", "XL"],
    isBestSeller: false,
    isNewArrival: true,
    isFeatured: false,
    stock: 50,
    tags: ["linen", "kurta", "casual", "summer"],
    averageRating: 4.2,
    reviewCount: 8,
  },
  {
    name: "Festive Anarkali Set",
    description: "Embroidered crimson red Anarkali suit with matching dupatta. Perfect for festivals and celebrations.",
    price: 8500,
    originalPrice: 10000,
    category: "Women",
    image: "https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=800&auto=format&fit=crop"
    ],
    sizes: ["XS", "S", "M", "L"],
    isBestSeller: true,
    isNewArrival: false,
    isFeatured: true,
    stock: 15,
    tags: ["anarkali", "festive", "embroidered"],
    averageRating: 4.7,
    reviewCount: 18,
  },
  {
    name: "Royal Banarasi Lehenga",
    description: "Stunning royal blue Banarasi silk lehenga with intricate gold weaving. A statement piece for the modern bride.",
    price: 28000,
    originalPrice: 35000,
    category: "Women",
    image: "https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=800&auto=format&fit=crop",
    sizes: ["S", "M", "L"],
    isBestSeller: true,
    isNewArrival: true,
    isFeatured: true,
    stock: 8,
    tags: ["lehenga", "banarasi", "bridal", "premium"],
    averageRating: 4.9,
    reviewCount: 6,
  },
  {
    name: "Cotton Pathani Suit",
    description: "Premium cotton Pathani suit in olive green. Comfort and tradition blended effortlessly.",
    price: 3500,
    originalPrice: 4000,
    category: "Men",
    image: "https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800&auto=format&fit=crop",
    sizes: ["M", "L", "XL", "XXL"],
    isBestSeller: false,
    isNewArrival: true,
    isFeatured: false,
    stock: 40,
    tags: ["pathani", "cotton", "traditional"],
    averageRating: 4.0,
    reviewCount: 5,
  },
  {
    name: "Kids Ethnic Kurta Set",
    description: "Adorable printed cotton kurta with pyjama set for little ones. Soft fabric, vibrant colours.",
    price: 1200,
    originalPrice: 1500,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800&auto=format&fit=crop",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    isBestSeller: false,
    isNewArrival: true,
    isFeatured: false,
    stock: 60,
    tags: ["kids", "kurta", "cotton", "festive"],
    averageRating: 4.3,
    reviewCount: 10,
  },
  {
    name: "Chanderi Silk Dupatta",
    description: "Lightweight Chanderi silk dupatta with delicate gold prints. The perfect accessory for any ethnic outfit.",
    price: 1800,
    originalPrice: 2200,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=800&auto=format&fit=crop",
    sizes: ["Free Size"],
    isBestSeller: false,
    isNewArrival: false,
    isFeatured: true,
    stock: 35,
    tags: ["dupatta", "chanderi", "silk", "accessory"],
    averageRating: 4.4,
    reviewCount: 7,
  },
  {
    name: "Embroidered Nehru Jacket",
    description: "Handcrafted Nehru jacket with detailed thread embroidery. Elevate any kurta instantly.",
    price: 4500,
    originalPrice: 5500,
    category: "Men",
    image: "https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    isBestSeller: true,
    isNewArrival: false,
    isFeatured: true,
    stock: 20,
    tags: ["nehru jacket", "embroidered", "premium"],
    averageRating: 4.6,
    reviewCount: 14,
  }
];

export const seedProductsIfEmpty = async () => {
  try {
    const productsCol = collection(db, "products");
    let productSnapshot = await getDocs(productsCol);

    if (productSnapshot.empty) {
      for (const prod of SAMPLE_PRODUCTS) {
        await addDoc(productsCol, { ...prod, createdAt: serverTimestamp() });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Seeding failed.", error);
    return false;
  }
};