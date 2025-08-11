
'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { getAuthInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
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
);


export function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuthInstance();
    if (auth) {
        await signOut(auth);
    }
    router.push('/');
  };

  const navLinks = [
    { href: '/standings', label: 'Standings', disabled: false },
    { href: '/leagues', label: 'Leagues', disabled: false },
    { href: '/matches', label: 'Matches', disabled: false },
    { href: '/players', label: 'Players', disabled: false },
    { href: '/news', label: 'News', disabled: false },
    { href: '/pricing', label: 'Pricing', disabled: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            PitchIQ
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.disabled ? '#' : link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                link.disabled && "pointer-events-none opacity-50"
              )}
              aria-disabled={link.disabled}
              tabIndex={link.disabled ? -1 : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
           {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLogout}>Log Out <LogOut className="ml-2 h-4 w-4"/></Button>
            </div>
          ) : (
             <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild size="sm"><Link href="/login">Log In</Link></Button>
                <Button asChild size="sm"><Link href="/signup">Sign Up</Link></Button>
             </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
              <div className="flex h-full flex-col gap-6 p-6 pt-0">
                <Link href="/" className="flex items-center gap-2">
                    <LogoIcon className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold font-headline text-foreground">
                        PitchIQ
                    </span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.disabled ? '#' : link.href}
                      className={cn(
                        "text-lg font-medium text-foreground transition-colors hover:text-primary",
                         link.disabled && "pointer-events-none opacity-50"
                      )}
                       aria-disabled={link.disabled}
                       tabIndex={link.disabled ? -1 : undefined}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2">
                  {user ? (
                     <Button variant="outline" onClick={handleLogout}>Log Out <LogOut className="ml-2 h-4 w-4"/></Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild><Link href="/login">Log In</Link></Button>
                      <Button asChild><Link href="/signup">Sign Up</Link></Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
