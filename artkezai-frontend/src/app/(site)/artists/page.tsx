'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useArtists } from '@/lib/hooks/useArtists';
import { ArtistSummary } from '@/types';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ArtistsPage() {
  const [search, setSearch] = useState('');
  const { data: artistsPage, isLoading, isError, refetch } = useArtists(1);

  const artists = artistsPage?.data ?? [];
  const filtered = artists.filter((a) => a.displayName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-dark min-h-screen pt-20">
      {/* ─── Page Header ─── */}
      <div className="bg-gradient-to-b from-dark to-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/"
              className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors duration-300"
            >
              Home
            </Link>
            <span className="text-subtle text-xs">/</span>
            <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-cream">Artists</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-gold" />
            <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-gold">The Artists</span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-cream mb-4">Meet the Artists</h1>
          <p className="font-inter text-sm text-muted max-w-lg">
            The independent painters behind the collection.
          </p>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="max-w-md mb-10">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder="Search artists by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border text-cream pl-10 pr-4 py-3 font-inter text-sm placeholder:text-subtle focus:outline-none focus:border-gold transition-colors duration-300 rounded-[10px]"
            />
          </div>
        </div>

        {!isLoading && !isError && (
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div>
              <p className="font-playfair text-2xl text-gold">{filtered.length}</p>
              <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
                {filtered.length === 1 ? 'artist' : 'artists'}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[var(--ios-radius-xl)] skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">Something went wrong</p>
            <p className="font-inter text-sm text-muted mb-6">We couldn&apos;t load the artists. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : artists.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">No artists to show yet</p>
            <p className="font-inter text-sm text-muted">
              Featured artists will appear here as they join the collection.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">No artists found</p>
            <p className="font-inter text-sm text-muted">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtistCard({ artist }: { artist: ArtistSummary }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/artists/${artist.slug}`}>
      <div
        className="ios-card overflow-hidden group cursor-pointer h-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-surface flex items-center justify-center">
          {artist.profilePhotoUrl ? (
            <Image
              src={artist.profilePhotoUrl}
              alt={artist.displayName}
              fill
              className={`object-cover transition-all duration-700 ease-out ${
                hovered ? 'scale-105 grayscale-0' : 'scale-100 grayscale'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <span className="font-playfair text-5xl text-gold/40">{initials(artist.displayName)}</span>
          )}

          {artist.countryName && (
            <div className="absolute top-4 left-4">
              <span className="ios-pill px-3 py-1 font-inter text-[10px] uppercase tracking-[0.08em] text-cream">
                {artist.countryName}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-playfair text-lg text-cream mb-1 group-hover:text-gold transition-colors duration-300">
            {artist.displayName}
          </h3>
          {artist.bio && (
            <p className="font-inter text-sm text-muted leading-relaxed line-clamp-2 mb-4">{artist.bio}</p>
          )}
          <div className="flex items-center justify-end pt-3 border-t border-border">
            <span className="font-inter text-[11px] uppercase tracking-[0.08em] text-gold group-hover:text-gold-hover transition-colors duration-300">
              View Profile →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
