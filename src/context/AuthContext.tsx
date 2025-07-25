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
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@reverseauctionpro.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log('User authenticated:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setUser(user);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error: any) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; // Re-throw to handle in UI
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    try {
      console.log('Starting signup process...');
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      console.log('User created successfully:', user.uid);
      
      // Update display name
      await updateProfile(user, { displayName: name });
      console.log('Profile updated successfully');
      
      // Determine role
      const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';
      console.log('User role determined:', role);

      // Create user document in Firestore
      const userDocData = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: role,
        createdAt: new Date().toISOString(), // Add timestamp
      };

      console.log('Creating Firestore document with data:', userDocData);
      
      await setDoc(doc(db, "users", user.uid), userDocData);
      console.log('Firestore document created successfully');
      
      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // If Firestore write fails but user was created, we should handle this
      if (error.code === 'permission-denied') {
        console.error('Firestore permission denied. Check your security rules.');
      } else if (error.code === 'unavailable') {
        console.error('Firestore is unavailable. Check your internet connection.');
      }
      
      throw error; // Re-throw to handle in UI
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};