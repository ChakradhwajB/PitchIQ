
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Newspaper, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
    return (
        <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-2">
                    <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
        <section className="flex-1 flex items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-background to-accent/50">
            <div className="max-w-3xl mx-auto">
                 <div className="p-4 bg-primary/10 rounded-full inline-block mb-6 animate-fade-in">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="48" 
                        height="48" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="hsl(var(--primary))"
                        strokeWidth="1.5"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M4 2v2" />
                        <path d="M20 2v2" />
                        <path d="M12 2v2" />
                        <path d="M4 11v-1a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v1" />
                        <path d="M4 14v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-1" />
                        <circle cx="12" cy="13" r="3" />
                        <path d="M8 20.15c.67-1.11 1.76-2.02 3-2.65" />
                        <path d="M16 20.15c-.67-1.11-1.76-2.02-3-2.65" />
                    </svg>
                </div>
                <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground animate-fade-in [animation-delay:0.2s]">
                    Welcome to PitchIQ
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in [animation-delay:0.4s]">
                    Your ultimate destination for comprehensive soccer statistics, real-time match data, and in-depth player analysis.
                </p>
                <div className="mt-8 flex justify-center gap-4 animate-fade-in [animation-delay:0.6s]">
                    <Button asChild size="lg">
                        <Link href="/standings">
                            View Standings <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/matches">
                            Explore Matches
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
        
        <section className="py-20 px-4 bg-background">
            <div className="container mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold">Everything You Need in One Place</h2>
                    <p className="text-muted-foreground mt-2">Explore the world of soccer like never before.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <FeatureCard 
                        icon={BarChart} 
                        title="League Standings" 
                        description="Stay updated with the latest league tables from top competitions around the world." 
                    />
                     <FeatureCard 
                        icon={Users} 
                        title="Player Insights" 
                        description="Dive deep into player stats, career history, and performance metrics." 
                    />
                     <FeatureCard 
                        icon={Newspaper} 
                        title="Latest News" 
                        description="Get the latest headlines and transfer news from the world of soccer." 
                    />
                </div>
            </div>
        </section>

        <section className="py-20 px-4 bg-accent/50">
            <div className="container mx-auto text-center">
                 <h2 className="text-3xl font-headline font-bold">Ready to Get Started?</h2>
                 <p className="text-muted-foreground mt-2 mb-8">Explore the latest standings and dive into the data.</p>
                 <Button asChild size="lg">
                    <Link href="/standings">
                        Go To Standings <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
