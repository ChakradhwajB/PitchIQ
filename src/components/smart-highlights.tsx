'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader } from 'lucide-react';
import { suggestInsights } from '@/ai/flows/suggest-insights';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SmartHighlightsProps {
  matchStatistics: string;
}

export default function SmartHighlights({ matchStatistics }: SmartHighlightsProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);
    try {
      const result = await suggestInsights({ matchStatistics });
      setInsights(result.insights);
    } catch (e) {
      setError('Failed to generate insights. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center justify-between">
            <span>Smart Highlights</span>
            <Lightbulb className="w-5 h-5 text-yellow-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the button to get AI-powered insights and commentary on the match.
        </p>
        <Button onClick={handleGenerateInsights} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Get Smart Highlights'
          )}
        </Button>
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {insights && (
            <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">AI Insights:</h4>
                <ul className="space-y-2 list-disc list-inside text-sm">
                    {insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                    ))}
                </ul>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
