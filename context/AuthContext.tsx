import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  auth, 
  getUserRole, 
  createUserDocument, 
  updateUserRole, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from '../services/firebase';
import { UserProfile } from '../types';

const SYSTEM_ADMIN_EMAILS = ['latheeshk@gmail.com', 'latheeshkal202601@gmail.com'];

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // If logged in via password, enforce verification
        if (firebaseUser.providerData[0]?.providerId === 'password' && !firebaseUser.emailVerified) {
             setUser(null);
             setLoading(false);
             return; 
        }

        // Ensure user doc exists
        await createUserDocument(firebaseUser);
        let role = await getUserRole(firebaseUser.uid);

        // AUTO-PROMOTE OVERRIDE for developer/system accounts
        const isSystemAdmin = firebaseUser.email && SYSTEM_ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase());
        if (isSystemAdmin && role !== 'admin') {
            try {
                await updateUserRole(firebaseUser.uid, 'admin');
                role = 'admin';
            } catch (e) {
                console.error("Auto-promotion failed. Firestore rules might be too strict.", e);
            }
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // STRICT VERIFICATION CHECK
        if (!userCredential.user.emailVerified) {
            await firebaseSignOut(auth);
            throw new Error("Email not verified. Please check your inbox for the verification link.");
        }
    } catch (error: any) {
        console.error("Error signing in with email", error);
        throw error;
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, {
              displayName: name
          });
          await createUserDocument(userCredential.user);
          
          // Send verification email
          try {
              await sendEmailVerification(userCredential.user);
          } catch (emailError) {
              console.warn("Failed to send verification email:", emailError);
          }

          // STRICT: Sign out immediately so they cannot access the app until verified
          await firebaseSignOut(auth);
          
      } catch (error: any) {
          console.error("Error signing up", error);
          throw error;
      }
  };

  const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email", error);
        throw error;
    }
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, loginWithEmail, signupWithEmail, resetPassword, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};