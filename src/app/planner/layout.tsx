
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Loader from '@/components/Loader';
import Header from '@/components/Header';
import { TaskProvider } from '@/hooks/use-tasks';
import { NoteProvider } from '@/hooks/use-notes';

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth state is no longer loading and there's no user,
    // it means they should be sent to the login page.
    // This can happen if they navigate here directly.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // While we are verifying the user or if the user is not yet available, show a loader.
  // This prevents a flash of the planner page before the redirect can happen.
  if (loading || !user) {
    return <Loader />;
  }

  return (
    <TaskProvider>
      <NoteProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </div>
      </NoteProvider>
    </TaskProvider>
  );
}
