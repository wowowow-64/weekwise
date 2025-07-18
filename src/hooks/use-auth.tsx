
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, initializeFirebase } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // Start with loading as true
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    // This effect runs once to initialize Firebase.
    initializeFirebase();
    setFirebaseInitialized(true);
  }, []);

  useEffect(() => {
    // This effect waits for Firebase to be initialized before setting up the auth listener.
    if (!firebaseInitialized) return;

    // The 'auth' object might be undefined on the very first render if the config
    // is being loaded from localStorage. If so, this effect will re-run once
    // firebaseInitialized is true and auth is available.
    if (!auth) {
        // We set a brief timeout to allow the firebase.ts module to complete its async setup.
        const timer = setTimeout(() => setFirebaseInitialized(true), 100);
        return () => clearTimeout(timer);
    }
    
    // onAuthStateChanged returns an unsubscribe function that we will call on cleanup.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Set loading to false once we have a user or know there isn't one.
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firebaseInitialized]);
  
  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
