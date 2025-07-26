"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

// Custom User interface that extends Firebase User with role
interface CustomUser extends FirebaseUser {
  role: string;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@reverseauctionpro.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        // Fetch user role from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userRole = 'user'; // default role
        if (userDoc.exists()) {
          userRole = userDoc.data().role || 'user';
        }
        
        // Create custom user object with role
        const customUser: CustomUser = {
          ...currentUser,
          role: userRole
        };
        
        setUser(customUser);
        setIsAdmin(userRole === 'admin');

        if (pathname === '/login' || pathname === '/register') {
          router.push('/auctions');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        const protectedRoutes = ['/auctions', '/create-auction', '/admin'];
        if(protectedRoutes.includes(pathname)) {
            router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;
    
    await updateProfile(newUser, { displayName: name });
    
    const role = newUser.email === ADMIN_EMAIL ? 'admin' : 'user';

    const userDocData = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: name,
      role: role,
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, "users", newUser.uid), userDocData);
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};