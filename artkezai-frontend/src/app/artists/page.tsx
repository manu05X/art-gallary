'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';

/* ── Static artist data ── */
const artists = [
  {
    id: '1',
    slug: 'elena-morozova',
    name: 'Elena Morozova',
    country: 'Russia',
    bio: 'Elena explores the boundaries between abstraction and emotion, using bold colour palettes and layered textures to create immersive visual experiences.',
    paintingCount: 24,
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
  },
  {
    id: '2',
    slug: 'james-whitfield',
    name: 'James Whitfield',
    country: 'United Kingdom',
    bio: 'A landscape painter who captures the quiet poetry of the English countryside, working primarily in oil and watercolour.',
    paintingCount: 18,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: '3',
    slug: 'priya-sharma',
    name: 'Priya Sharma',
    country: 'India',
    bio: 'Priya blends traditional Indian motifs with contemporary mixed-media techniques, creating vibrant works that bridge cultures.',
    paintingCount: 31,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    id: '4',
    slug: 'lucas-berg',
    name: 'Lucas Berg',
    country: 'Sweden',
    bio: 'Minimalist landscapes inspired by Scandinavian light. Lucas works with muted tones and wide horizons to evoke stillness and contemplation.',
    paintingCount: 12,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
  {
    id: '5',
    slug: 'amara-osei',
    name: 'Amara Osei',
    country: 'Ghana',
    bio: 'Amara creates powerful portraits that celebrate African identity, using rich earth tones and expressive brushwork.',
    paintingCount: 15,
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  },
  {
    id: '6',
    slug: 'sofia-martinez',
    name: 'Sofia Martinez',
    country: 'Argentina',
    bio: 'Abstract expressionist whose large-scale canvases channel the energy of Buenos Aires through bold gestural marks and vivid colour.',
    paintingCount: 20,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  },
];

export default function ArtistsPage() {
  const [search, setSearch] = useState('');

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-cream">
              Artists
            </span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-cream mb-4">
            Meet Our Artists
          </h1>
          <p className="font-inter text-sm text-muted max-w-lg">
            Discover the talented painters behind our curated collection. Each artist brings a unique perspective and story.
          </p>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="max-w-md mb-10">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder="Search artists by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border text-cream pl-10 pr-4 py-3 font-inter text-sm placeholder-subtle focus:outline-none focus:border-gold transition-colors duration-300"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <p className="font-playfair text-2xl text-gold">{filtered.length}</p>
            <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
              artists
            </p>
          </div>
        </div>

        {/* Artist Grid */}
        {filtered.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">No artists found</p>
            <p className="font-inter text-sm text-muted">
              Try a different search term.
            </p>
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

/* ── Artist Card ── */
function ArtistCard({
  artist,
}: {
  artist: {
    id: string;
    slug: string;
    name: string;
    country: string;
    bio: string;
    paintingCount: number;
    image: string;
  };
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/artists/${artist.slug}`}>
      <div
        className="card-surface overflow-hidden group cursor-pointer h-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Portrait */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface">
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              hovered ? 'scale-105 grayscale-0' : 'scale-100 grayscale'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Country badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-dark/80 backdrop-blur-sm px-3 py-1 font-inter text-[10px] uppercase tracking-[0.15em] text-cream">
              {artist.country}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-playfair text-lg text-cream mb-1 group-hover:text-gold transition-colors duration-300">
            {artist.name}
          </h3>
          <p className="font-inter text-sm text-muted leading-relaxed line-clamp-2 mb-4">
            {artist.bio}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="font-inter text-[11px] uppercase tracking-[0.12em] text-subtle">
              {artist.paintingCount} paintings
            </span>
            <span className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold group-hover:text-gold-hover transition-colors duration-300">
              View Profile →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
