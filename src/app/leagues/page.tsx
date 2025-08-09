
import { getLeagues } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function LeaguesPage() {
  const leagues = await getLeagues();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold text-foreground mb-8">
        Leagues
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {leagues.map(league => (
          <Link href={`/league/${league.id}`} key={league.id} className="group">
            <Card className="flex h-full flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <CardHeader className="flex-row items-center gap-4">
                {league.logo && <Image src={league.logo} alt={league.name} width={48} height={48} data-ai-hint="league logo" />}
                <div>
                  <CardTitle className="font-headline text-xl">{league.name}</CardTitle>
                  <CardDescription>{league.country}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex justify-end items-end">
                  <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
