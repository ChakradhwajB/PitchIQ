
'use client';

import * as React from 'react';
import { getNews, NEWS_SOURCES } from '@/lib/api';
import type { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ArticleCard({ article }: { article: NewsArticle }) {
  const image = article.images?.[0];

  return (
    <Card className="flex flex-col overflow-hidden rounded-xl shadow-lg transition-shadow hover:shadow-xl">
      <CardHeader className="p-0">
        {image && (
          <div className="aspect-video overflow-hidden">
            <Image
              src={image.url}
              alt={image.caption || article.headline}
              width={image.width}
              height={image.height}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="news article image"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <CardTitle className="font-headline text-xl leading-snug">
          <Link href={article.links.web.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {article.headline}
          </Link>
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(article.published), { addSuffix: true })}
        </p>
        <CardDescription className="mt-4 text-base leading-relaxed">
          {article.description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" className="w-full">
            <Link href={article.links.web.href} target="_blank" rel="noopener noreferrer">
                Read Full Story <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ArticleSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden rounded-xl shadow-lg">
            <CardHeader className="p-0">
                <Skeleton className="aspect-video w-full" />
            </CardHeader>
            <CardContent className="flex-grow p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}


export default function NewsPage() {
  const [articles, setArticles] = React.useState<NewsArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = React.useState<string>('all');
  
  React.useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      setArticles([]); // Clear previous articles before fetching new ones
      try {
        const newsData = await getNews(selectedLeague);
        setArticles(newsData);
      } catch (e) {
        setError("Could not fetch news. Please try again later.");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [selectedLeague]);

  const leagueName = NEWS_SOURCES[selectedLeague]?.name || 'All Leagues';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-4xl font-headline font-bold text-foreground">
                {leagueName} News
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              The latest headlines, powered by ESPN.
            </p>
        </div>
         <Select onValueChange={setSelectedLeague} value={selectedLeague}>
            <SelectTrigger className="w-full sm:w-[200px] font-body">
              <SelectValue placeholder="Select League" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NEWS_SOURCES).map(([key, { name }]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>

       {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}
           </div>
       ) : error ? (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
       ) : articles.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
       ) : (
            <p className="text-center text-muted-foreground py-12">No news articles found for this league.</p>
       )}
    </div>
  );
}
