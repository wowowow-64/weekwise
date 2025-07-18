
'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import Loader from '@/components/Loader';
import { ThemeProvider } from '@/components/theme-provider';

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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
