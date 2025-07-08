'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskItem from './TaskItem';
import type { Day, Task } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface DayColumnProps {
  day: Day;
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newText: string) => void;
  onSuggestTask: () => Promise<void>;
}

export default function DayColumn({
  day,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onSuggestTask
}: DayColumnProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleSuggestClick = () => {
    startTransition(async () => {
      await onSuggestTask();
    });
  };

  return (
    <Card className="flex h-full min-h-[400px] flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{day}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <ScrollArea className="flex-grow pr-4">
            <div className="flex flex-col gap-2">
            {tasks.length > 0 ? (
                tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => onToggleTask(task.id)}
                    onDelete={() => onDeleteTask(task.id)}
                    onUpdate={(newText) => onUpdateTask(task.id, newText)}
                />
                ))
            ) : (
                <p className="text-sm text-muted-foreground">No tasks for today.</p>
            )}
            </div>
        </ScrollArea>
        
        <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <form onSubmit={handleAddTask} className="flex gap-2">
                <Input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new task..."
                aria-label={`New task for ${day}`}
                />
                <Button type="submit" size="icon" aria-label="Add task">
                    <Plus className="h-4 w-4" />
                </Button>
            </form>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleSuggestClick} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Suggest Task
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
