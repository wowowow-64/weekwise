
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
    
    // Fetch tasks from the last 90 days to improve performance
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoTimestamp = Timestamp.fromDate(ninetyDaysAgo);

    const q = query(
      tasksCollectionRef,
      where('createdAt', '>=', ninetyDaysAgoTimestamp),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const newTasks: DayTasks = { ...initialTasks };

        snapshot.forEach(doc => {
            const task = { id: doc.id, ...doc.data() } as Task;
            if (newTasks[task.day] && !newTasks[task.day].some(t => t.id === task.id)) {
                newTasks[task.day].push(task);
            }
        });

        const allTasksText = Object.values(newTasks).flat().map(t => t.text);
        setAllTasksForAI(allTasksText);
        setTasks(newTasks);
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
    const newTaskDoc = await addDoc(tasksCollectionRef, {
      text,
      completed: false,
      day,
      createdAt: Timestamp.now(),
    });
    const newTask: Task = {
        id: newTaskDoc.id,
        text,
        completed: false,
        day,
        createdAt: Timestamp.now(),
    };
    setTasks(prev => ({...prev, [day]: [newTask, ...prev[day]]}));
  };

  const toggleTask = async (day: Day, taskId: string) => {
    if (!user) return;
    const task = tasks[day]?.find(t => t.id === taskId);
    if (!task) return;
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskDocRef, { completed: !task.completed });
    setTasks(prev => ({...prev, [day]: prev[day].map(t => t.id === taskId ? {...t, completed: !t.completed} : t)}))
  };
  
  const deleteTask = async (day: Day, taskId: string) => {
    if (!user) return;
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(taskDocRef);
    setTasks(prev => ({...prev, [day]: prev[day].filter(t => t.id !== taskId)}));
  };

  const updateTask = async (day: Day, taskId: string, newText: string) => {
    if (!user) return;
    const taskDocRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskDocRef, { text: newText });
    setTasks(prev => ({...prev, [day]: prev[day].map(t => t.id === taskId ? {...t, text: newText} : t)}))
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
