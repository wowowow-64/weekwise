
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, initializeFirebase } from '@/lib/firebase';
import Loader from '@/components/Loader';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    initializeFirebase();
    setFirebaseInitialized(true);
  }, []);

  useEffect(() => {
    if (!firebaseInitialized) return;

    // The 'auth' object might not be available on the first render if the config
    // needs to be loaded from localStorage. This effect will re-run once 'auth' is initialized.
    if (!auth) {
        // Set a timeout to check again, giving firebase time to initialize.
        // This is a simple way to wait for the async initialization.
        const timer = setTimeout(() => setFirebaseInitialized(true), 100);
        return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseInitialized]);
  
  const value = { user, loading: loading || !firebaseInitialized };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
