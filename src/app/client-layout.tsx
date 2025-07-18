
'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import Loader from '@/components/Loader';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    initializeFirebase();
    setFirebaseInitialized(true);
  }, []);

  if (!firebaseInitialized) {
    return <Loader />;
  }
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
