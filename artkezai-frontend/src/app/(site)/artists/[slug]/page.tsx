'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Instagram, Globe, ArrowLeft } from 'lucide-react';
import PaintingCard from '@/components/gallery/PaintingCard';
import { useArtist } from '@/lib/hooks/useArtists';
import { usePaintings } from '@/lib/hooks/usePaintings';

const FALLBACK_PAINTING_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function instagramHref(value: string): string {
  if (value.startsWith('http')) return value;
  return `https://instagram.com/${value.replace(/^@/, '')}`;
}

export default function ArtistDetailPage({ params }: { params: { slug: string } }) {
  const { data: artist, isLoading, isError } = useArtist(params.slug);
  const { data: worksPage, isLoading: worksLoading } = usePaintings(
    { artistId: artist?.id },
    1,
    'newest'
  );

  if (isLoading) {
    return (
      <div className="bg-dark min-h-screen pt-20 flex items-center justify-center p-6">
        <div className="card-surface p-16 text-center">
          <p className="font-playfair text-2xl text-cream mb-2">Loading artist…</p>
          <p className="font-inter text-sm text-muted">Fetching profile details.</p>
        </div>
      </div>
    );
  }

  if (isError || !artist) {
    return (
      <div className="bg-dark min-h-screen pt-20 flex items-center justify-center p-6">
        <div className="card-surface p-16 text-center max-w-md">
          <p className="font-playfair text-2xl text-cream mb-2">Artist not found</p>
          <p className="font-inter text-sm text-muted mb-6">
            This artist doesn&apos;t exist, or their profile isn&apos;t public.
          </p>
          <Link
            href="/artists"
            className="inline-flex items-center gap-2 font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
          >
            <ArrowLeft size={14} />
            All Artists
          </Link>
        </div>
      </div>
    );
  }

  const works = worksPage?.data ?? [];
  const storyParagraphs = artist.story?.split('\n').filter((p) => p.trim()) ?? [];
  const instagramUrl = artist.instagram?.trim() ? instagramHref(artist.instagram.trim()) : null;
  const websiteUrl = artist.websiteUrl?.trim() || null;

  return (
    <div className="bg-dark min-h-screen pt-20">
      {/* ─── Profile Header ─── */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-br from-surface via-dark to-surface border-b border-border" />

        <div className="max-w-5xl mx-auto px-6 -mt-20 md:-mt-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative w-36 h-36 md:w-44 md:h-44 overflow-hidden border border-border rounded-[var(--ios-radius-lg)] bg-surface-hover p-2 flex-shrink-0 shadow-[var(--ios-shadow-sm)]">
              <div className="relative h-full w-full overflow-hidden rounded-[12px] border border-border bg-surface flex items-center justify-center">
                {artist.profilePhotoUrl ? (
                  <Image src={artist.profilePhotoUrl} alt={artist.displayName} fill className="object-cover" priority />
                ) : (
                  <span className="font-playfair text-4xl text-gold/40">{initials(artist.displayName)}</span>
                )}
              </div>
            </div>

            <div className="flex-1 pt-2 md:pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href="/artists"
                  className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors duration-300"
                >
                  Artists
                </Link>
                <span className="text-subtle text-xs">/</span>
                <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-cream">
                  {artist.displayName}
                </span>
              </div>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-cream mb-3">{artist.displayName}</h1>

              {artist.countryName && (
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={14} className="text-gold" />
                  <span className="font-inter text-sm text-muted">{artist.countryName}</span>
                </div>
              )}

              {artist.bio && (
                <p className="font-inter text-sm text-muted leading-relaxed max-w-xl mb-5">{artist.bio}</p>
              )}

              {(instagramUrl || websiteUrl) && (
                <div className="flex items-center gap-4">
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-inter text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold-hover transition-colors duration-300"
                    >
                      <Instagram size={14} />
                      Instagram
                    </a>
                  )}
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-inter text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold-hover transition-colors duration-300"
                    >
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Artist Story ─── */}
      {storyParagraphs.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-playfair text-2xl text-cream mb-8">The Artist&apos;s Story</h2>
          <div className="space-y-4">
            {storyParagraphs.map((p, i) => (
              <p key={i} className="font-inter text-sm text-muted leading-[1.8]">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ─── Paintings — real APPROVED works only, via the gallery API's
             existing artistId filter (always scoped to APPROVED) ─── */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="mb-8 pb-6 border-b border-border">
          <h2 className="font-playfair text-2xl text-cream">Paintings by {artist.displayName.split(' ')[0]}</h2>
          {!worksLoading && (
            <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted mt-1">
              {works.length} {works.length === 1 ? 'work' : 'works'} available
            </p>
          )}
        </div>

        {worksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[var(--ios-radius-xl)] skeleton" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-xl text-cream mb-2">No approved works yet</p>
            <p className="font-inter text-sm text-muted">Check back soon for new pieces from this artist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((painting) => (
              <PaintingCard
                key={painting.id}
                id={painting.id}
                title={painting.title}
                slug={painting.slug}
                price={painting.price}
                currency={painting.currency}
                primaryImageUrl={painting.primaryImageUrl || FALLBACK_PAINTING_IMAGE}
                thumbnailUrl={painting.thumbnailUrl || undefined}
                artist={{ displayName: artist.displayName, slug: artist.slug, country: artist.countryName || '' }}
                medium={painting.mediumName || ''}
                category={painting.categoryName || ''}
                isOfferEnabled={painting.isOfferEnabled}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
