export interface Task {
  id: string;
  text: string;
  completed: boolean;
  day: Day;
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
