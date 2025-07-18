
'use client';

import React, { useCallback } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useNotes } from '@/hooks/use-notes';
import type { Day } from '@/lib/types';
import DayColumn from './DayColumn';
import { getSuggestedTaskAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function WeeklyPlanner() {
  const { tasks, loading: tasksLoading, addTask, toggleTask, deleteTask, updateTask, allTasksForAI } = useTasks();
  const { notes, loading: notesLoading, updateNote } = useNotes();
  const { toast } = useToast();

  const handleAddTask = useCallback((day: Day, text: string) => {
    addTask(day, text);
  }, [addTask]);

  const handleToggleTask = useCallback((day: Day, taskId: string) => {
    toggleTask(day, taskId);
  }, [toggleTask]);

  const handleDeleteTask = useCallback((day: Day, taskId: string) => {
    deleteTask(day, taskId);
  }, [deleteTask]);

  const handleUpdateTask = useCallback((day: Day, taskId: string, newText: string) => {
    updateTask(day, taskId, newText);
  }, [updateTask]);

  const handleUpdateNote = useCallback((day: Day, content: string) => {
    updateNote(day, content);
  }, [updateNote]);
  
  const handleSuggestTask = useCallback(async (day: Day) => {
    const result = await getSuggestedTaskAction(day, allTasksForAI);

    if (result.success && result.data && result.data.length > 0) {
      const suggestion = result.data[Math.floor(Math.random() * result.data.length)];
      addTask(day, suggestion);
      toast({
        title: 'Task Suggested!',
        description: `Added "${suggestion}" to ${day}.`,
      });
    } else {
       toast({
        title: 'Suggestion Failed',
        description: result.error || "Couldn't come up with a suggestion. Please try again.",
        variant: 'destructive',
      });
    }
  }, [allTasksForAI, addTask, toast]);

  if (tasksLoading || notesLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {daysOfWeek.map(day => <div key={day} className="h-[500px] w-full rounded-lg bg-card shadow-sm animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
      {daysOfWeek.map((day) => (
        <DayColumn
          key={day}
          day={day}
          tasks={tasks?.[day] ?? []}
          note={notes?.[day] ?? null}
          onAddTask={(text) => handleAddTask(day, text)}
          onToggleTask={(taskId) => handleToggleTask(day, taskId)}
          onDeleteTask={(taskId) => handleDeleteTask(day, taskId)}
          onUpdateTask={(taskId, newText) => handleUpdateTask(day, taskId, newText)}
          onSuggestTask={() => handleSuggestTask(day)}
          onUpdateNote={(content) => handleUpdateNote(day, content)}
        />
      ))}
    </div>
  );
}
