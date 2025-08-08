
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
  where,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Task, Day, DayTasks } from '@/lib/types';
import { daysOfWeek } from '@/lib/config';

interface TasksContextType {
    tasks: DayTasks | null;
    addTask: (day: Day, text: string) => Promise<void>;
    toggleTask: (day: Day, taskId: string) => Promise<void>;
    deleteTask: (day: Day, taskId: string) => Promise<void>;
    updateTask: (day: Day, taskId: string, newText: string) => Promise<void>;
    allTasksForAI: string[];
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const initialTasks: DayTasks = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DayTasks | null>(null);

  useEffect(() => {
    if (!user) {
      setTasks(initialTasks);
      return;
    }

    const firestore = getFirebaseFirestore();
    const tasksCollectionRef = collection(firestore, 'users', user.uid, 'tasks');
    
    const q = query(
      tasksCollectionRef,
      where('day', 'in', daysOfWeek),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTasksState: DayTasks = { ...initialTasks };
      snapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        const dayOfWeek = task.day;
        if (newTasksState[dayOfWeek]) {
          newTasksState[dayOfWeek].push(task);
        } else {
          console.warn(`Task with id ${task.id} has invalid day: ${task.day}`);
        }
      });
      setTasks(newTasksState);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
      setTasks(initialTasks); // Set to initial on error
    });

    return () => unsubscribe();
  }, [user]);

  const allTasksForAI = useMemo(() => {
    if (!tasks) return [];
    return Object.values(tasks).flat().map(t => t.text);
  }, [tasks]);

  const addTask = useCallback(async (day: Day, text: string) => {
    if (!user) return;
    const firestore = getFirebaseFirestore();
    const tasksCollectionRef = collection(firestore, 'users', user.uid, 'tasks');
    await addDoc(tasksCollectionRef, {
      text,
      completed: false,
      day,
      createdAt: Timestamp.now(),
    });
  }, [user]);

  const toggleTask = useCallback(async (day: Day, taskId: string) => {
    if (!user || !tasks) return;
    const task = tasks[day]?.find(t => t.id === taskId);
    if (!task) return;
    const firestore = getFirebaseFirestore();
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskDocRef, { completed: !task.completed });
  }, [user, tasks]);
  
  const deleteTask = useCallback(async (day: Day, taskId: string) => {
    if (!user) return;
    const firestore = getFirebaseFirestore();
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  }, [user]);

  const updateTask = useCallback(async (day: Day, taskId: string, newText: string) => {
    if (!user) return;
    const firestore = getFirebaseFirestore();
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskDocRef, { text: newText });
  }, [user]);

  const value = { tasks, addTask, toggleTask, deleteTask, updateTask, allTasksForAI };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
