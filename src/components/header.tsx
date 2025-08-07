import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Footprints } from 'lucide-react';

export function Header() {
  const navLinks = [
    { href: '/', label: 'Standings' },
    { href: '#', label: 'Matches' },
    { href: '#', label: 'Players' },
    { href: '#', label: 'News' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Footprints className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            PitchIQ
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Log In
          </Button>
          <Button size="sm" className="hidden md:inline-flex">
            Sign Up
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2">
                    <Footprints className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold font-headline text-foreground">
                        PitchIQ
                    </span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2">
                    <Button>Sign Up</Button>
                    <Button variant="outline">Log In</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
