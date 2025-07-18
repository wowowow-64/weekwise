
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookCheck, Loader2, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from "next-themes"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getWeeklySummaryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default function Header() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGetSummary = async () => {
    setIsLoading(true);
    setSummary('');

    const allTasks = Object.values(tasks).flat();
    const completedTasks = allTasks.filter((t) => t.completed).map((t) => t.text);
    const incompleteTasks = allTasks.filter((t) => !t.completed).map((t) => t.text);
    
    if (completedTasks.length === 0 && incompleteTasks.length === 0) {
        toast({
            title: 'No tasks found',
            description: "Add some tasks to your week to get a summary.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    const result = await getWeeklySummaryAction(completedTasks, incompleteTasks);
    if (result.success) {
      setSummary(result.data!);
      setIsSummaryOpen(true);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };
  
  const handleSignOut = async () => {
    const auth = getFirebaseAuth();
    await auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          WeekWise
        </h1>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex items-center gap-2">
              <Button onClick={handleGetSummary} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BookCheck className="mr-2 h-4 w-4" />
                )}
                Summarize Week
              </Button>
              <ThemeToggle />
            </div>
            {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>
                        <UserIcon/>
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}
        </div>
      </header>
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Your Weekly Summary</DialogTitle>
            <DialogDescription>
              Here&apos;s a look at your accomplishments and remaining tasks for the week.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-h-[60vh] overflow-y-auto rounded-md border bg-secondary/50 p-4 text-secondary-foreground">
            {summary}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
