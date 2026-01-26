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
  User
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
  orderBy
} from "firebase/firestore";
import { Product, UserRole, UserProfile } from "../types";

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

// --- User Management Helpers ---

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

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
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
      const { email, displayName } = user;

      const isSystemAdmin = email && SYSTEM_ADMIN_EMAILS.includes(email.toLowerCase());
      const finalRole = isSystemAdmin ? 'admin' : role;

      await setDoc(userRef, {
        displayName,
        email,
        role: finalRole,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.warn("Error creating user document:", error);
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
}

export const deleteUserDocument = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user document:", error);
    throw error;
  }
}

// --- Product Management ---

export const getProducts = async (): Promise<Product[]> => {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const saveProduct = async (product: Partial<Product> & { id?: string }) => {
  const productsCol = collection(db, 'products');
  if (product.id) {
    const productRef = doc(db, 'products', product.id);
    const { id, ...data } = product;
    await updateDoc(productRef, data);
    return product.id;
  } else {
    const docRef = await addDoc(productsCol, product);
    return docRef.id;
  }
};

export const deleteProduct = async (id: string) => {
  const productRef = doc(db, 'products', id);
  await deleteDoc(productRef);
};

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
};

const SAMPLE_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: "Midnight Silk Saree",
    description: "Handwoven pure silk saree in deep midnight blue with gold zari border.",
    price: 12000,
    category: "Women",
    image: "https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=800&auto=format&fit=crop",
    sizes: ["Free Size"],
    isBestSeller: true
  },
  {
    name: "Classic Linen Kurta",
    description: "Breathable linen kurta in beige, perfect for summer gatherings.",
    price: 2500,
    category: "Men",
    image: "https://images.unsplash.com/photo-1597983073493-88cd357a28e0?q=80&w=800&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    isBestSeller: false
  },
  {
    name: "Festive Anarkali Set",
    description: "Embroidered crimson red Anarkali suit with matching dupatta.",
    price: 8500,
    category: "Women",
    image: "https://images.unsplash.com/photo-1583391733958-e026b143f282?q=80&w=800&auto=format&fit=crop",
    sizes: ["XS", "S", "M", "L"],
    isBestSeller: true
  }
];

export const seedProductsIfEmpty = async () => {
  try {
    const productsCol = collection(db, "products");
    let productSnapshot = await getDocs(productsCol);

    if (productSnapshot.empty) {
      for (const prod of SAMPLE_PRODUCTS) {
        await addDoc(productsCol, prod);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Seeding failed.", error);
    return false;
  }
};