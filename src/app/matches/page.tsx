'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFixturesByDate } from '@/lib/api';
import type { Fixture } from '@/lib/types';
import FixtureList from '@/components/fixture-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function formatDateForApi(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export default function MatchesPage() {
  const [fixtures, setFixtures] = React.useState<Fixture[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const dateStr = formatDateForApi(selectedDate);
      const fixturesData = await getFixturesByDate(dateStr);
      setFixtures(fixturesData);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Matches
        </h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Fixtures for {format(selectedDate, "PPP")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : fixtures.length > 0 ? (
            <FixtureList fixtures={fixtures} />
          ) : (
            <p>No matches scheduled for this date. The free tier of TheSportsDB has limited data for this query.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
