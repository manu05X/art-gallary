import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-inter text-xs uppercase tracking-widest text-muted mb-4">404</p>
        <h1 className="font-playfair text-4xl text-cream mb-6">This page could not be found</h1>
        <Link href="/gallery" className="font-inter text-gold hover:underline">
          Browse the gallery
        </Link>
      </div>
    </main>
  );
}
