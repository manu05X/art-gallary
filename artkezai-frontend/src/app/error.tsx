'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-inter text-xs uppercase tracking-widest text-muted mb-4">Something went wrong</p>
        <h1 className="font-playfair text-4xl text-cream mb-6">We couldn&apos;t load this page</h1>
        <div className="flex items-center justify-center gap-6">
          <button onClick={reset} className="font-inter text-gold hover:underline">
            Try again
          </button>
          <Link href="/" className="font-inter text-muted hover:text-cream">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
