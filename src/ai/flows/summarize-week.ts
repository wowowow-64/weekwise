'use server';

/**
 * @fileOverview Summarizes the user's completed and incomplete tasks for the week.
 *
 * - summarizeWeek - A function that summarizes the week's tasks.
 * - SummarizeWeekInput - The input type for the summarizeWeek function.
 * - SummarizeWeekOutput - The return type for the summarizeWeek function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWeekInputSchema = z.object({
  completedTasks: z.array(z.string()).describe('List of tasks completed this week.'),
  incompleteTasks: z.array(z.string()).describe('List of tasks not completed this week.'),
});
export type SummarizeWeekInput = z.infer<typeof SummarizeWeekInputSchema>;

const SummarizeWeekOutputSchema = z.object({
  summary: z.string().describe('A summary of the week, highlighting accomplishments and areas for improvement.'),
});
export type SummarizeWeekOutput = z.infer<typeof SummarizeWeekOutputSchema>;

export async function summarizeWeek(input: SummarizeWeekInput): Promise<SummarizeWeekOutput> {
  return summarizeWeekFlow(input);
}

const summarizeWeekPrompt = ai.definePrompt({
  name: 'summarizeWeekPrompt',
  input: {schema: SummarizeWeekInputSchema},
  output: {schema: SummarizeWeekOutputSchema},
  prompt: `Summarize the user\'s week based on the following completed and incomplete tasks. Highlight accomplishments and areas for improvement.

Completed Tasks:
{{#each completedTasks}}
- {{this}}
{{/each}}

Incomplete Tasks:
{{#each incompleteTasks}}
- {{this}}
{{/each}}

Summary:`,
});

const summarizeWeekFlow = ai.defineFlow(
  {
    name: 'summarizeWeekFlow',
    inputSchema: SummarizeWeekInputSchema,
    outputSchema: SummarizeWeekOutputSchema,
  },
  async input => {
    const {output} = await summarizeWeekPrompt(input);
    return output!;
  }
);
