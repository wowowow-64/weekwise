'use server';

import { suggestTasks } from '@/ai/flows/suggest-tasks';
import { summarizeWeek } from '@/ai/flows/summarize-week';
import type { Day } from '@/lib/types';

export async function getSuggestedTaskAction(
  dayOfWeek: Day,
  pastTasks: string[]
) {
  try {
    const result = await suggestTasks({ dayOfWeek, pastTasks });
    return { success: true, data: result.suggestedTasks };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to suggest tasks.' };
  }
}

export async function getWeeklySummaryAction(
  completedTasks: string[],
  incompleteTasks: string[]
) {
  try {
    const result = await summarizeWeek({ completedTasks, incompleteTasks });
    return { success: true, data: result.summary };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate summary.' };
  }
}
