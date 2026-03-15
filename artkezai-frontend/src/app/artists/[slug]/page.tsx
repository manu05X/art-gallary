'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Instagram, Globe, ArrowLeft } from 'lucide-react';

/* ── Static artist data (keyed by slug) ── */
const artistData: Record<
  string,
  {
    name: string;
    country: string;
    bio: string;
    story: string;
    image: string;
    social: { instagram?: string; website?: string };
    paintings: {
      id: string;
      title: string;
      slug: string;
      price: number;
      medium: string;
      image: string;
    }[];
  }
> = {
  'elena-morozova': {
    name: 'Elena Morozova',
    country: 'Russia',
    bio: 'Elena explores the boundaries between abstraction and emotion, using bold colour palettes and layered textures to create immersive visual experiences.',
    story:
      'Born in Saint Petersburg, Elena grew up surrounded by the grandeur of classical Russian art. After studying at the Repin Academy, she moved to Berlin where the city\'s raw energy transformed her practice. Her canvases became larger, bolder — each one an attempt to capture feeling itself.\n\nToday her work hangs in private collections across Europe and Asia. She paints daily in her studio overlooking the Spree, fuelled by strong tea and an endless curiosity about colour.',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80',
    social: { instagram: '#', website: '#' },
    paintings: [
      {
        id: '1',
        title: 'Amber Reverie',
        slug: 'amber-reverie',
        price: 1200,
        medium: 'Oil on Canvas',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
      },
      {
        id: '5',
        title: 'Fractured Light',
        slug: 'fractured-light',
        price: 1800,
        medium: 'Mixed Media',
        image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80',
      },
      {
        id: '7',
        title: 'Whispers of Dawn',
        slug: 'whispers-of-dawn',
        price: 2200,
        medium: 'Oil on Canvas',
        image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=80',
      },
    ],
  },
  'james-whitfield': {
    name: 'James Whitfield',
    country: 'United Kingdom',
    bio: 'A landscape painter who captures the quiet poetry of the English countryside, working primarily in oil and watercolour.',
    story:
      'James discovered painting during long walks through the Lake District as a teenager. What began as quick plein air sketches evolved into a lifelong dedication to landscape painting.\n\nHis work is characterised by soft, atmospheric light and a reverence for the subtle shifts of the English seasons. He lives in a converted barn in the Cotswolds where he paints from dawn.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    social: { website: '#' },
    paintings: [
      {
        id: '2',
        title: 'Twilight Over the Valley',
        slug: 'twilight-over-the-valley',
        price: 2400,
        medium: 'Acrylic on Canvas',
        image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80',
      },
      {
        id: '4',
        title: 'Golden Hour Fields',
        slug: 'golden-hour-fields',
        price: 3100,
        medium: 'Oil on Canvas',
        image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80',
      },
      {
        id: '8',
        title: 'Solitude',
        slug: 'solitude',
        price: 1450,
        medium: 'Watercolor',
        image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80',
      },
    ],
  },
  'priya-sharma': {
    name: 'Priya Sharma',
    country: 'India',
    bio: 'Priya blends traditional Indian motifs with contemporary mixed-media techniques, creating vibrant works that bridge cultures.',
    story:
      'Growing up in Jaipur, Priya was immersed in the rich colours of Rajasthani art and textiles. She studied fine art in Mumbai before completing a residency in New York that opened her eyes to the possibilities of mixed media.\n\nHer paintings are a dialogue between heritage and modernity — intricate patterns meet bold abstract forms. She currently splits her time between Delhi and London.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    social: { instagram: '#', website: '#' },
    paintings: [
      {
        id: '3',
        title: 'Silent Conversation',
        slug: 'silent-conversation',
        price: 800,
        medium: 'Watercolor',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
      },
      {
        id: '6',
        title: 'The Red Door',
        slug: 'the-red-door',
        price: 950,
        medium: 'Acrylic on Canvas',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
      },
      {
        id: '9',
        title: 'Urban Pulse',
        slug: 'urban-pulse',
        price: 3400,
        medium: 'Mixed Media',
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&q=80',
      },
    ],
  },
};

/* ── Fallback for unknown slugs ── */
const fallbackArtist = {
  name: 'Artist',
  country: '',
  bio: '',
  story: '',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
  social: {},
  paintings: [],
};

export default function ArtistDetailPage({ params }: { params: { slug: string } }) {
  const artist = artistData[params.slug] || fallbackArtist;
  const notFound = !artistData[params.slug];

  if (notFound) {
    return (
      <div className="bg-dark min-h-screen pt-20 flex items-center justify-center">
        <div className="card-surface p-16 text-center max-w-md">
          <p className="font-playfair text-2xl text-cream mb-2">Artist not found</p>
          <p className="font-inter text-sm text-muted mb-6">
            We couldn't find the artist you're looking for.
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

  const storyParagraphs = artist.story.split('\n').filter(Boolean);

  return (
    <div className="bg-dark min-h-screen pt-20">
      {/* ─── Hero / Profile Header ─── */}
      <div className="relative">
        {/* Gold gradient banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-surface via-dark to-surface border-b border-border" />

        <div className="max-w-5xl mx-auto px-6 -mt-20 md:-mt-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Portrait */}
            <div className="relative w-36 h-36 md:w-44 md:h-44 overflow-hidden border-2 border-border flex-shrink-0">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info */}
            <div className="flex-1 pt-2 md:pt-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href="/artists"
                  className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors duration-300"
                >
                  Artists
                </Link>
                <span className="text-subtle text-xs">/</span>
                <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-cream">
                  {artist.name}
                </span>
              </div>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-cream mb-3">
                {artist.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-gold" />
                <span className="font-inter text-sm text-muted">{artist.country}</span>
              </div>

              <p className="font-inter text-sm text-muted leading-relaxed max-w-xl mb-5">
                {artist.bio}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {artist.social.instagram && (
                  <a
                    href={artist.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-inter text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold-hover transition-colors duration-300"
                  >
                    <Instagram size={14} />
                    Instagram
                  </a>
                )}
                {artist.social.website && (
                  <a
                    href={artist.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-inter text-[11px] uppercase tracking-[0.12em] text-gold hover:text-gold-hover transition-colors duration-300"
                  >
                    <Globe size={14} />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Artist Story ─── */}
      {artist.story && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-playfair text-2xl text-cream mb-8">The Artist's Story</h2>
          <div className="space-y-4">
            {storyParagraphs.map((p, i) => (
              <p key={i} className="font-inter text-sm text-muted leading-[1.8]">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ─── Paintings ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h2 className="font-playfair text-2xl text-cream">
              Paintings by {artist.name.split(' ')[0]}
            </h2>
            <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted mt-1">
              {artist.paintings.length} works available
            </p>
          </div>
        </div>

        {artist.paintings.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-xl text-cream mb-2">No paintings available yet</p>
            <p className="font-inter text-sm text-muted">
              Check back soon for new works from this artist.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artist.paintings.map((painting) => (
              <ArtistPaintingCard key={painting.id} painting={painting} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Painting Card (inline) ── */
function ArtistPaintingCard({
  painting,
}: {
  painting: {
    id: string;
    title: string;
    slug: string;
    price: number;
    medium: string;
    image: string;
  };
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/painting/${painting.slug}`}>
      <div
        className="card-surface overflow-hidden group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface">
          <Image
            src={painting.image}
            alt={painting.title}
            fill
            className={`object-cover transition-transform duration-700 ease-out ${
              hovered ? 'scale-105' : 'scale-100'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          <div
            className={`absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[rgba(15,15,15,0.95)] to-transparent flex flex-col justify-end p-4 transition-all duration-500 ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-inter text-[10px] uppercase tracking-[0.15em] text-muted">
                {painting.medium}
              </span>
              <span className="font-playfair text-sm text-gold">
                ${painting.price.toLocaleString()}
              </span>
            </div>
            <span className="font-inter text-[10px] uppercase tracking-[0.15em] text-gold">
              View Painting →
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-playfair text-sm text-cream leading-snug mb-1">
            {painting.title}
          </h3>
          <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
            ${painting.price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
