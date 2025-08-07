'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating smart highlights and insights based on soccer match statistics.
 *
 * - suggestMatchInsights - A function that takes match statistics as input and returns AI-powered insights.
 * - SuggestMatchInsightsInput - The input type for the suggestMatchInsights function.
 * - SuggestMatchInsightsOutput - The return type for the suggestMatchInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMatchInsightsInputSchema = z.object({
  matchStatistics: z.string().describe('Comprehensive soccer match statistics in JSON format.'),
});
export type SuggestMatchInsightsInput = z.infer<typeof SuggestMatchInsightsInputSchema>;

const SuggestMatchInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('A list of AI-generated insights based on the match statistics.'),
});
export type SuggestMatchInsightsOutput = z.infer<typeof SuggestMatchInsightsOutputSchema>;

export async function suggestMatchInsights(input: SuggestMatchInsightsInput): Promise<SuggestMatchInsightsOutput> {
  return suggestMatchInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMatchInsightsPrompt',
  input: {schema: SuggestMatchInsightsInputSchema},
  output: {schema: SuggestMatchInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes soccer match statistics and provides key insights and talking points.

  Given the following match statistics, generate a list of relevant, interesting, and concise insights about the match and player performance.
  Focus on the most important and unusual aspects that would be of interest to a soccer fan.

  Match Statistics:
  {{matchStatistics}}

  Insights:
  `
});

const suggestMatchInsightsFlow = ai.defineFlow(
  {
    name: 'suggestMatchInsightsFlow',
    inputSchema: SuggestMatchInsightsInputSchema,
    outputSchema: SuggestMatchInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
