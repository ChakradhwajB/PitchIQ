
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

const SuggestShotsInputSchema = z.object({
  matchStatistics: z.string().describe('Comprehensive soccer match statistics in JSON format, including teams, goals, and player lists.'),
});
export type SuggestShotsInput = z.infer<typeof SuggestShotsInputSchema>;

// Define the final output structure we want.
const ShotSchema = z.object({
  x: z.number(),
  y: z.number(),
  teamId: z.number(),
  type: z.enum(['Goal', 'Saved', 'Miss']),
  player: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export type SuggestShotsOutput = {
    shots: z.infer<typeof ShotSchema>[];
}

export async function suggestShots(input: SuggestShotsInput): Promise<SuggestShotsOutput> {
  return suggestShotsFlow(input);
}

// A simpler schema for the AI to output: just an array of strings.
const aIShotOutputSchema = z.object({
    shots: z.array(z.string()).describe('List of shots as comma-separated strings: "x,y,teamId,type,playerId,playerName"'),
});

const prompt = ai.definePrompt({
  name: 'suggestShotsPrompt',
  model: 'gemma-3-1b-it',
  input: {schema: SuggestShotsInputSchema},
  output: {schema: aIShotOutputSchema }, // The AI's output is now a simple list of strings.
  prompt: `You are an AI assistant that creates plausible shot map data for a soccer match based on its statistics.

  Given the following match statistics, generate a list of shots. 
  - Each shot must be a comma-separated string with the format: "x,y,teamId,type,playerId,playerName".
  - 'type' must be one of: Goal, Saved, Miss.
  - The number of 'Goal' type shots must exactly match the final score for each team.
  - The total number of shots for each team should roughly match their "Total Shots" statistic.
  - Distribute shots among the listed players for each team.
  - Shot coordinates (x, y) must be within the bounds of a standard soccer pitch (0-105 for x, 0-68 for y).
  - Home team shots should be on one half, away team on the other.

  Match Statistics:
  {{matchStatistics}}

  Generate the shots as a list of comma-separated strings now.
  `,
});

const suggestShotsFlow = ai.defineFlow(
  {
    name: 'suggestShotsFlow',
    inputSchema: SuggestShotsInputSchema,
    outputSchema: z.custom<SuggestShotsOutput>(),
  },
  async (input) : Promise<SuggestShotsOutput> => {
    const {output: aiOutput} = await prompt(input);
    
    if (!aiOutput || !aiOutput.shots) {
      // If the AI fails to return anything, return an empty array.
      return { shots: [] };
    }

    const parsedShots: z.infer<typeof ShotSchema>[] = [];
    
    for (const shotString of aiOutput.shots) {
      try {
        const parts = shotString.split(',');
        if (parts.length < 6) continue;

        const [xStr, yStr, teamIdStr, type, playerIdStr, ...playerNameParts] = parts;
        const playerName = playerNameParts.join(',').trim(); // Handle names with commas

        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        const teamId = parseInt(teamIdStr, 10);
        const playerId = parseInt(playerIdStr, 10);

        // Validate the parsed data
        if (
          !isNaN(x) && x >= 0 && x <= 105 &&
          !isNaN(y) && y >= 0 && y <= 68 &&
          !isNaN(teamId) &&
          !isNaN(playerId) &&
          ['Goal', 'Saved', 'Miss'].includes(type) &&
          playerName
        ) {
          parsedShots.push({
            x,
            y,
            teamId,
            type: type as 'Goal' | 'Saved' | 'Miss',
            player: {
              id: playerId,
              name: playerName,
            },
          });
        }
      } catch (e) {
        // Ignore lines that fail to parse
        console.warn(`Could not parse shot string: "${shotString}"`, e);
      }
    }
    
    return { shots: parsedShots };
  }
);
