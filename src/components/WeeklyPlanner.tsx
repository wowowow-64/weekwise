'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Day, DayTasks, Task } from '@/lib/types';
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

const initialTasks: DayTasks = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

export default function WeeklyPlanner() {
  const [tasks, setTasks] = useLocalStorage<DayTasks>('tasks', initialTasks);
  const { toast } = useToast();

  const handleAddTask = (day: Day, text: string) => {
    const newTask: Task = { id: crypto.randomUUID(), text, completed: false };
    setTasks((prev) => ({
      ...prev,
      [day]: [...prev[day], newTask],
    }));
  };

  const handleToggleTask = (day: Day, taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [day]: prev[day].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  const handleDeleteTask = (day: Day, taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [day]: prev[day].filter((task) => task.id !== taskId),
    }));
  };

  const handleUpdateTask = (day: Day, taskId: string, newText: string) => {
    setTasks((prev) => ({
      ...prev,
      [day]: prev[day].map((task) =>
        task.id === taskId ? { ...task, text: newText } : task
      ),
    }));
  };
  
  const handleSuggestTask = async (day: Day) => {
    const allTasks = Object.values(tasks).flat().map(t => t.text);
    const result = await getSuggestedTaskAction(day, allTasks);

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
