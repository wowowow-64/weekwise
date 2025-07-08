'use client';

import React from 'react';
import { useTasks } from '@/hooks/use-tasks';
import type { Day } from '@/lib/types';
import DayColumn from './DayColumn';
import { getSuggestedTaskAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Loader from './Loader';

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
  const { tasks, loading, addTask, toggleTask, deleteTask, updateTask, allTasksForAI } = useTasks();
  const { toast } = useToast();

  const handleAddTask = (day: Day, text: string) => {
    addTask(day, text);
  };

  const handleToggleTask = (day: Day, taskId: string) => {
    toggleTask(day, taskId);
  };

  const handleDeleteTask = (day: Day, taskId: string) => {
    deleteTask(day, taskId);
  };

  const handleUpdateTask = (day: Day, taskId: string, newText: string) => {
    updateTask(day, taskId, newText);
  };
  
  const handleSuggestTask = async (day: Day) => {
    const result = await getSuggestedTaskAction(day, allTasksForAI);

    if (result.success && result.data && result.data.length > 0) {
      const suggestion = result.data[Math.floor(Math.random() * result.data.length)];
      handleAddTask(day, suggestion);
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
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {daysOfWeek.map(day => <div key={day} className="h-[400px] w-full rounded-lg bg-card shadow-sm animate-pulse" />)}
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
          onAddTask={(text) => handleAddTask(day, text)}
          onToggleTask={(taskId) => handleToggleTask(day, taskId)}
          onDeleteTask={(taskId) => handleDeleteTask(day, taskId)}
          onUpdateTask={(taskId, newText) => handleUpdateTask(day, taskId, newText)}
          onSuggestTask={() => handleSuggestTask(day)}
        />
      ))}
    </div>
  );
}
