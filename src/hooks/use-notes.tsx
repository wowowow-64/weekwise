
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Day, DayNotes, Note } from '@/lib/types';

interface NotesContextType {
    notes: DayNotes | null;
    updateNote: (day: Day, content: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const initialNotes: DayNotes = {
  Monday: null,
  Tuesday: null,
  Wednesday: null,
  Thursday: null,
  Friday: null,
  Saturday: null,
  Sunday: null,
};

export function NoteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<DayNotes | null>(null);

  useEffect(() => {
    if (!user) {
      setNotes(initialNotes);
      return;
    }

    const notesCollectionRef = collection(firestore, 'users', user.uid, 'notes');
    const q = query(notesCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData: DayNotes = { ...initialNotes };
      snapshot.docs.forEach(doc => {
        const note = { id: doc.id, ...doc.data() } as Note;
        notesData[note.id as Day] = note;
      });

      setNotes(notesData);
    }, (error) => {
      console.error("Error fetching notes: ", error);
      setNotes(initialNotes); // Set to initial on error
    });

    return () => unsubscribe();
  }, [user]);

  const updateNote = useCallback(async (day: Day, content: string) => {
    if (!user) return;
    const noteDocRef = doc(firestore, 'users', user.uid, 'notes', day);
    await setDoc(noteDocRef, {
      id: day,
      content,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }, [user]);

  const value = { notes, updateNote };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
    const context = useContext(NotesContext);
    if (context === undefined) {
        throw new Error('useNotes must be used within a NoteProvider');
    }
    return context;
}
