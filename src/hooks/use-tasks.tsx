
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Task, Day, DayTasks } from '@/lib/types';

interface TasksContextType {
    tasks: DayTasks;
    loading: boolean;
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
  const [tasks, setTasks] = useState<DayTasks>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [allTasksForAI, setAllTasksForAI] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setTasks(initialTasks);
      setAllTasksForAI([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tasksCollectionRef = collection(firestore, 'users', user.uid, 'tasks');
    const q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Task & {createdAt: Timestamp})[];
      
      const groupedTasks: DayTasks = { ...initialTasks };
      // Explicitly clear arrays to avoid stale data
      Object.keys(groupedTasks).forEach(day => {
        groupedTasks[day as Day] = [];
      });

      tasksData.forEach(task => {
        if (groupedTasks[task.day]) {
          groupedTasks[task.day].push(task);
        }
      });

      setTasks(groupedTasks);
      setAllTasksForAI(tasksData.map(t => t.text));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async (day: Day, text: string) => {
    if (!user) return;
    const tasksCollectionRef = collection(firestore, 'users', user.uid, 'tasks');
    await addDoc(tasksCollectionRef, {
      text,
      completed: false,
      day,
      createdAt: Timestamp.now(),
    });
  };

  const toggleTask = async (day: Day, taskId: string) => {
    if (!user) return;
    const task = tasks[day]?.find(t => t.id === taskId);
    if (!task) return;
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskDocRef, { completed: !task.completed });
  };
  
  const deleteTask = async (day: Day, taskId: string) => {
    if (!user) return;
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  };

  const updateTask = async (day: Day, taskId: string, newText: string) => {
    if (!user) return;
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskDocRef, { text: newText });
  };

  const value = { tasks, loading, addTask, toggleTask, deleteTask, updateTask, allTasksForAI };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
