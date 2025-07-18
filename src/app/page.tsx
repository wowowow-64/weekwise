'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Loader from '@/components/Loader';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We want to wait until the auth state is no longer loading.
    if (!loading) {
      if (user) {
        // If the user is logged in, redirect to the planner.
        router.replace('/planner');
      } else {
        // If the user is not logged in, redirect to the login page.
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Show a loader while we determine the user's auth state.
  return <Loader />;
}
