
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { auth, db } from '@/lib/firebase/firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

export interface ProfileUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  role: 'admin' | 'user';
  createdAt?: string;
  wonAuctions?: string[];
}

interface CustomUser extends FirebaseUser, ProfileUser {}

interface AuthContextType {
  user: CustomUser | null;
  allUsers: ProfileUser[];
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: (uid: string) => Promise<ProfileUser | null>;
  getAllUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@reverseauctionpro.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [allUsers, setAllUsers] = useState<ProfileUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        const userData = userDoc.exists() ? userDoc.data() as ProfileUser : { role: 'user', uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName };
        
        const customUser: CustomUser = Object.assign({}, currentUser, userData);
        
        setUser(customUser);
        setIsAdmin(userData.role === 'admin');

        if (pathname === '/login' || pathname === '/register') {
          router.push('/auctions');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        const protectedRoutes = ['/auctions', '/create-auction', '/admin', '/profile'];
        if(protectedRoutes.some(p => pathname.startsWith(p))) {
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

    const userDocData: ProfileUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: name,
      role: role,
      createdAt: new Date().toISOString(),
      wonAuctions: [],
    };
    
    await setDoc(doc(db, "users", newUser.uid), userDocData);
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const getUserProfile = useCallback(async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as ProfileUser;
    }
    return null;
  }, []);
  
  const getAllUsers = useCallback(async () => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => doc.data() as ProfileUser);
    setAllUsers(usersList);
  }, []);

  const value = {
    user,
    allUsers,
    loading,
    isAdmin,
    login,
    signup,
    logout,
    getUserProfile,
    getAllUsers
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
