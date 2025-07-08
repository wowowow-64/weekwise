// src/ai/flows/suggest-tasks.ts
'use server';
/**
 * @fileOverview AI-powered task suggestion flow.
 *
 * This file defines a Genkit flow that suggests tasks for a user's weekly planner based on the day of the week and their past tasks.
 *
 * @requires genkit
 * @requires z
 *
 * @exports suggestTasks - The main function to trigger the task suggestion flow.
 * @exports SuggestTasksInput - The input type for the suggestTasks function.
 * @exports SuggestTasksOutput - The output type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  dayOfWeek: z
    .string()
    .describe("The day of the week for which to suggest tasks (e.g., 'Monday')."),
  pastTasks: z
    .array(z.string())
    .describe('An array of the user\'s past tasks.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  suggestedTasks: z
    .array(z.string())
    .describe('An array of suggested tasks for the given day.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const suggestTasksPrompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a personal assistant that suggests tasks for a user's weekly planner.

  Based on the day of the week and the user's past tasks, suggest tasks that the user might want to add to their planner.
  Return the suggested tasks as a JSON array of strings.

  Day of the week: {{{dayOfWeek}}}
  Past tasks: {{#if pastTasks}}{{#each pastTasks}}- {{{this}}}{{/each}}{{else}}No past tasks{{/if}}
  `,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await suggestTasksPrompt(input);
    return output!;
  }
);
