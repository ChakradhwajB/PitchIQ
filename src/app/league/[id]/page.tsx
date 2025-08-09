
import { getLeagueDetails, getTeamsInLeague } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default async function LeaguePage({ params }: { params: { id: string } }) {
  const league = await getLeagueDetails(params.id);

  if (!league) {
    notFound();
  }

  const teams = await getTeamsInLeague(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
        {/* League Banner */}
        {league.banner && (
            <div className="relative mb-8 h-48 w-full overflow-hidden rounded-xl shadow-lg">
                <Image src={league.banner} alt={`${league.name} banner`} layout="fill" objectFit="cover" data-ai-hint="league banner"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-4 left-4 flex items-center gap-4">
                    {league.logo && <Image src={league.logo} alt={league.name} width={64} height={64} className="bg-white/10 p-2 rounded-md" data-ai-hint="league logo"/>}
                    <div>
                        <h1 className="text-4xl font-headline font-bold text-white shadow-md">{league.name}</h1>
                        <p className="text-lg text-white/90 shadow-sm flex items-center gap-2">
                           <Globe className="w-5 h-5" /> {league.country}
                        </p>
                    </div>
                </div>
            </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* League Info */}
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">About the League</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <p>{league.description || 'No description available for this league.'}</p>
                </CardContent>
            </Card>
            {league.trophy && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Trophy</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <Image src={league.trophy} alt={`${league.name} trophy`} width={128} height={128} className="object-contain" data-ai-hint="league trophy"/>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Teams List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Teams</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams.length > 0 ? (
                teams.map(team => (
                  <Link href={`/team/${team.id}?name=${encodeURIComponent(team.name)}`} key={team.id} className="group">
                    <div className="flex flex-col items-center gap-2 text-center p-3 rounded-lg hover:bg-accent transition-colors">
                      <Image
                        src={team.logo}
                        alt={team.name}
                        width={64}
                        height={64}
                        className="transition-transform group-hover:scale-110 object-contain"
                        data-ai-hint="team logo"
                      />
                      <p className="text-sm font-medium">{team.name}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center">No teams found for this league.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
