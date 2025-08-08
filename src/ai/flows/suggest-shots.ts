'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating plausible shot data for a soccer match based on its statistics.
 *
 * - suggestShots - A function that takes match statistics and returns a generated shot map.
 * - SuggestShotsInput - The input type for the suggestShots function.
 * - SuggestShotsOutput - The return type for the suggestShots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShotSchema = z.object({
  x: z.number().describe('The x-coordinate of the shot on a 105x68 pitch.'),
  y: z.number().describe('The y-coordinate of the shot on a 105x68 pitch.'),
  teamId: z.number().describe('The ID of the team that took the shot.'),
  type: z.enum(['Goal', 'Saved', 'Miss']).describe('The outcome of the shot.'),
  player: z.object({
    id: z.number().describe('The ID of the player who took the shot.'),
    name: z.string().describe('The name of the player who took the shot.'),
  }).describe('The player who took the shot.'),
});

const SuggestShotsInputSchema = z.object({
  matchStatistics: z.string().describe('Comprehensive soccer match statistics in JSON format, including teams, goals, and player lists.'),
});
export type SuggestShotsInput = z.infer<typeof SuggestShotsInputSchema>;

const SuggestShotsOutputSchema = z.object({
  shots: z.array(ShotSchema).describe('A list of generated shots for the match.'),
});
export type SuggestShotsOutput = z.infer<typeof SuggestShotsOutputSchema>;

export async function suggestShots(input: SuggestShotsInput): Promise<SuggestShotsOutput> {
  return suggestShotsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestShotsPrompt',
  input: {schema: SuggestShotsInputSchema},
  output: {schema: SuggestShotsOutputSchema},
  prompt: `You are an AI assistant that creates plausible shot map data for a soccer match based on its statistics.

  Given the following match statistics, generate a list of shots. The number of shots for each team should roughly match their "Total Shots" statistic. The number of goals must match the final score. Distribute shots among the listed players. The shot coordinates (x, y) must be within the bounds of a standard soccer pitch (0-105 for x, 0-68 for y). Shots for the home team should originate from the left side of the pitch (x < 52.5) and shots for the away team from the right side (x > 52.5).

  Match Statistics:
  {{matchStatistics}}

  Shots:
  `,
});

const suggestShotsFlow = ai.defineFlow(
  {
    name: 'suggestShotsFlow',
    inputSchema: SuggestShotsInputSchema,
    outputSchema: SuggestShotsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Filter shots to ensure they are within the pitch boundaries, just in case.
    if (output?.shots) {
        output.shots = output.shots.filter(shot => shot.x >= 0 && shot.x <= 105 && shot.y >= 0 && shot.y <= 68);
    }
    return output!;
  }
);
