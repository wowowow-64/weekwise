'use client';

import React, { useState } from 'react';
import { BookCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getWeeklySummaryAction } from '@/app/actions';
import type { DayTasks, Task } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const initialTasks: DayTasks = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

export default function Header() {
  const [tasks] = useLocalStorage<DayTasks>('tasks', initialTasks);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          WeekWise
        </h1>
        <Button onClick={handleGetSummary} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BookCheck className="mr-2 h-4 w-4" />
          )}
          Summarize Week
        </Button>
      </div>
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
