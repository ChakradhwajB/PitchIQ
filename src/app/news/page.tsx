import { getNews } from '@/lib/api';
import type { NewsArticle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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


export default async function NewsPage() {
  const articles = await getNews();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Premier League News
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The latest headlines, powered by ESPN.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
