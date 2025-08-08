'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating smart highlights and insights based on soccer match statistics.
 *
 * - suggestInsights - A function that takes match statistics as input and returns AI-powered insights.
 * - SuggestInsightsInput - The input type for the suggestInsights function.
 * - SuggestInsightsOutput - The return type for the suggestInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInsightsInputSchema = z.object({
  matchStatistics: z.string().describe('Comprehensive soccer match statistics in JSON format.'),
});
export type SuggestInsightsInput = z.infer<typeof SuggestInsightsInputSchema>;

const SuggestInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('A list of AI-generated insights based on the match statistics.'),
});
export type SuggestInsightsOutput = z.infer<typeof SuggestInsightsOutputSchema>;

export async function suggestInsights(input: SuggestInsightsInput): Promise<SuggestInsightsOutput> {
  return suggestInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInsightsPrompt',
  model: 'gemma-3-1b-it',
  input: {schema: SuggestInsightsInputSchema},
  output: {schema: SuggestInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes soccer match statistics and provides key insights.

  Given the following match statistics, generate a list of relevant and interesting insights about the match and player performance.
  Be concise and focus on the most important aspects.

  Match Statistics:
  {{matchStatistics}}

  Insights:
  `, // Ensure the prompt ends appropriately for generating a list
});

const suggestInsightsFlow = ai.defineFlow(
  {
    name: 'suggestInsightsFlow',
    inputSchema: SuggestInsightsInputSchema,
    outputSchema: SuggestInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
