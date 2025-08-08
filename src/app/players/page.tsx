'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { searchPlayersByName } from '@/lib/api';
import type { Player } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [results, setResults] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    const players = await searchPlayersByName(searchTerm);
    setResults(players);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Player Search
        </h1>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <Input 
            type="text"
            placeholder="e.g., Lionel Messi"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[250px]"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : <Search />}
          </Button>
        </form>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
                {results.map(player => (
                    <Link href={`/player/${player.id}`} key={player.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                        <Image src={player.photo} alt={player.name} width={48} height={48} className="rounded-full bg-muted object-cover" data-ai-hint="player photo"/>
                        <div>
                            <p className="font-bold">{player.name}</p>
                            <p className="text-sm text-muted-foreground">{player.nationality}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">{player.position}</Badge>
                    </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
                <User className="mx-auto h-12 w-12 mb-4" />
                <p>{searched ? 'No players found.' : 'Search for a player to see results.'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
