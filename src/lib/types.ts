import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  day: Day;
  createdAt: Timestamp;
}

export interface Note {
  id: Day;
  content: string;
}

export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type DayTasks = Record<Day, Task[]>;
export type DayNotes = Record<Day, Note | null>;
