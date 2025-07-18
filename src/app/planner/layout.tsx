'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Loader from '@/components/Loader';
import Header from '@/components/Header';
import { TaskProvider } from '@/hooks/use-tasks';

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loader />;
  }

  return (
    <TaskProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </TaskProvider>
  );
}
