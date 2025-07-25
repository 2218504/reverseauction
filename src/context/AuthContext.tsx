
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/firebase';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@reverseauctionpro.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const checkAdminRole = async (user: User) => {
    if (user.email === ADMIN_EMAIL) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
        } else {
            // This could be the case where the admin user doc hasn't been created yet
            // or the role is not set. We can default to email check as a fallback.
            setIsAdmin(true);
        }
    } else {
        setIsAdmin(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await checkAdminRole(user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if(userCredential.user) {
        await checkAdminRole(userCredential.user);
    }
    setLoading(false);
    return userCredential;
  };

  const signup = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    
    const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';

    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: role
    });
    
    setUser({ ...user, displayName: name });
    setIsAdmin(role === 'admin');

    return userCredential;
  };

  const logout = () => {
    setIsAdmin(false);
    return signOut(auth).then(() => {
        router.push('/login');
    });
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
