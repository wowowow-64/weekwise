
'use client';

import React, { useState, useTransition, useEffect, ChangeEvent } from 'react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskItem from './TaskItem';
import type { Day, Task, Note } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';

interface DayColumnProps {
  day: Day;
  tasks: Task[];
  note: Note | null;
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, newText: string) => void;
  onSuggestTask: () => Promise<void>;
  onUpdateNote: (content: string) => void;
}

function DayColumn({
  day,
  tasks,
  note,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onSuggestTask,
  onUpdateNote,
}: DayColumnProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [noteContent, setNoteContent] = useState(note?.content || '');
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    // Sync local state if the note prop changes from the outside
    // This happens on initial load or if another client changes the data
    setNoteContent(note?.content || '');
  }, [note]);

  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    // Update local state immediately for a responsive UI
    setNoteContent(newContent); 
    // Call the debounced update function passed from the parent
    onUpdateNote(newContent); 
  };


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
    <Card className="flex h-full min-h-[500px] flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{day}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="flex-grow flex flex-col gap-4">
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tasks</h3>
            <ScrollArea className="h-[200px] pr-4">
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
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Notes</h3>
            <Textarea
              value={noteContent}
              onChange={handleNoteChange}
              placeholder="Your notes for the day..."
              className="h-[120px] resize-none"
              aria-label={`Notes for ${day}`}
            />
          </div>
        </div>
        
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

export default React.memo(DayColumn);
