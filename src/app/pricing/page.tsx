
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
    ctaLink: '#', // Placeholder for payment integration
    primary: true,
  },
];

export default function PricingPage() {
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
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              'flex flex-col shadow-lg rounded-xl',
              tier.primary && 'border-primary border-2 relative'
            )}
          >
            {tier.primary && (
                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
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
                asChild
                className="w-full"
                variant={tier.primary ? 'default' : 'outline'}
                disabled={tier.ctaLink === '#'}
              >
                <Link href={tier.ctaLink}>{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
