import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <div className="text-center text-sm text-muted-foreground sm:text-left">
          <p>&copy; {new Date().getFullYear()} PitchIQ. All rights reserved.</p>
          <p>
            Football data provided by{' '}
            <a
              href="https://www.thesportsdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              TheSportsDB
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
