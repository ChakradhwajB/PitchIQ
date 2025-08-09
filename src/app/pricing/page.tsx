
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    frequency: '/month',
    description: 'Get started with the basics. Perfect for casual fans.',
    features: [
      'View League Standings',
      'See Match Results & Fixtures',
      'Explore Player Profiles',
      'Read the Latest News',
    ],
    cta: 'Sign Up for Free',
    ctaLoggedIn: 'Your Current Plan',
    ctaUpgrade: 'Downgrade to Free',
    ctaLink: '/signup',
    primary: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    frequency: '/month',
    description: 'Unlock advanced insights and an ad-free experience.',
    features: [
      'Everything in the Free plan',
      'AI-Generated Smart Highlights',
      'Detailed Player Heatmaps',
      'In-depth Match Statistics',
      'Ad-free Experience',
    ],
    cta: 'Upgrade to Pro',
    ctaLoggedIn: 'Your Current Plan',
    ctaLink: '#', // Placeholder for payment integration
    primary: true,
  },
];

export default function PricingPage() {
  const { user, isProUser, setProTierActivated } = useAuth();
  const router = useRouter();

  const handleCtaClick = (tierName: string) => {
    if (!user) {
        router.push('/login?redirect=/pricing');
        return;
    }

    if (tierName === 'Pro') {
      if (isProUser) return; // Already Pro, do nothing
      // In a real app, this would trigger a payment flow.
      setProTierActivated(true);
      toast({
          title: 'Upgrade Successful!',
          description: "You've unlocked all Pro features. Enjoy!",
      });
    } else if (tierName === 'Free') {
      if (!isProUser) return; // Already Free, do nothing
      setProTierActivated(false);
       toast({
        title: 'Downgrade Successful',
        description: "You have been returned to the Free plan.",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-foreground">
          Find the perfect plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Whether you're a casual fan or a data enthusiast, PitchIQ has a plan that fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier) => {
            const isCurrentUserPlan = (tier.name === 'Pro' && isProUser) || (tier.name === 'Free' && !isProUser);
          
            return (
                <Card
                    key={tier.name}
                    className={cn(
                    'flex flex-col shadow-lg rounded-xl',
                    tier.primary && 'border-primary border-2 relative'
                    )}
                >
                    {tier.primary && (
                        <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                            <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Most Popular
                            </div>
                        </div>
                    )}
                    <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.frequency}</span>
                    </div>
                    <CardDescription className="pt-2">{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <ul className="space-y-4">
                        {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                        ))}
                    </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={() => handleCtaClick(tier.name)}
                            disabled={user && isCurrentUserPlan}
                            variant={tier.primary ? 'default' : 'outline'}
                        >
                            {user ? (isCurrentUserPlan ? 'Your Current Plan' : (tier.name === 'Pro' ? 'Upgrade to Pro' : 'Downgrade to Free')) : 'Sign Up to Choose'}
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
