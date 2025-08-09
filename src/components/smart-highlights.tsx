
'use client';

import * as React from 'react';
import type { Match } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Star, Lock, Wand2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface SmartHighlightsProps {
  match: Match;
}

function ProFeatureCallout() {
    return (
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
                 <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    AI Smart Highlights
                 </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">Get AI-generated summaries and a visual shot map of the match. Upgrade to Pro to unlock this feature.</p>
                <Button asChild>
                    <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
            </CardContent>
        </Card>
    )
}


export default function SmartHighlights({ match }: SmartHighlightsProps) {
  const { isProUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  
  if (!isProUser) {
    return <ProFeatureCallout />;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                AI Smart Highlights
            </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="space-y-6">
                <div>
                    <h3 className="font-bold mb-2">Match Summary</h3>
                    <p className="text-sm text-muted-foreground">AI-generated match summaries are coming soon for Pro users!</p>
                </div>
                 <div>
                    <h3 className="font-bold mb-2">Shot Map</h3>
                    <div className="relative aspect-[105/68] w-full bg-green-600/10 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
                        <p className="text-center text-muted-foreground m-auto text-sm p-4">AI-powered shot maps are coming soon for Pro users!</p>
                    </div>
                </div>
           </div>
        </CardContent>
    </Card>
  );
}
