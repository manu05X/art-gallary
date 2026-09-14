'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';
import PaintingCard from '@/components/gallery/PaintingCard';
import { usePaintings } from '@/lib/hooks/usePaintings';
import { PaintingListDto } from '@/types';

// Same convention as the gallery page: a painting with no uploaded image
// yet still needs a visual — a neutral stock stand-in, never a fake painting.
const FALLBACK_PAINTING_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80';

interface ArtistSummary {
  name: string;
  slug: string;
  country: string;
  image: string;
}

/* ────────────────────────────────────────────────
   HERO — editorial split: manifesto text + one real
   painting presented as a museum wall label. Falls
   back to a text-only composition if no approved
   artwork with an image exists yet.
   ──────────────────────────────────────────────── */
function Hero({ painting, totalCount }: { painting: PaintingListDto | null; totalCount: number }) {
  return (
    <section className="relative bg-dark border-b border-border overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
        {/* Text */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-px bg-gold/50" />
            <span className="font-inter text-[10px] uppercase tracking-[0.18em] text-gold font-semibold">
              Original Paintings Marketplace
            </span>
          </div>

          <AnimatedText
            as="h1"
            text="Collect original art, directly from the artist."
            className="font-playfair leading-[1.04] text-[clamp(36px,5.2vw,64px)] font-semibold text-cream mb-8"
          />

          <AnimatedSection delay={0.3}>
            <p className="font-inter text-[15px] text-muted leading-relaxed max-w-md mb-10">
              A curated marketplace connecting independent painters directly with collectors
              around the world.
              {totalCount > 0 && (
                <>
                  {' '}
                  <span className="text-gold">{totalCount.toLocaleString()}</span> original{' '}
                  {totalCount === 1 ? 'work' : 'works'} currently live in the collection.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/gallery"
                className="group ios-button-primary flex items-center justify-center gap-2 font-inter text-[11px] uppercase tracking-[0.08em] px-9 py-4"
              >
                Explore the Gallery
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/auth/register"
                className="ios-button-secondary flex items-center justify-center font-inter text-[11px] uppercase tracking-[0.08em] px-9 py-4"
              >
                Join as an Artist
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Artwork */}
        <AnimatedSection direction="right" delay={0.15} className="order-1 lg:order-2">
          {painting ? (
            <Link href={`/painting/${painting.slug}`} className="group block relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--ios-radius-xl)] border border-[var(--ios-glass-border)] shadow-[var(--ios-shadow-lg)]">
                <Image
                  src={painting.primaryImageUrl || FALLBACK_PAINTING_IMAGE}
                  alt={painting.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
                {/* Wall label — mobile: inline overlay */}
                <div className="absolute inset-x-0 bottom-0 lg:hidden bg-gradient-to-t from-black/85 to-transparent p-5 pt-14">
                  <p className="font-inter text-[10px] uppercase tracking-widest text-muted">{painting.artistName}</p>
                  <p className="font-playfair text-lg text-cream mt-0.5">{painting.title}</p>
                  <p className="font-inter text-sm text-gold mt-1">
                    {painting.currency} {painting.price.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Wall label — desktop: offset card */}
              <div className="hidden lg:block ios-glass rounded-[18px] px-6 py-4 absolute -bottom-6 -left-6 max-w-[78%]">
                <p className="font-inter text-[10px] uppercase tracking-widest text-muted">{painting.artistName}</p>
                <p className="font-playfair text-lg text-cream mt-0.5 truncate">{painting.title}</p>
                <div className="flex items-center justify-between mt-1.5 gap-3">
                  <p className="font-inter text-sm text-gold">
                    {painting.currency} {painting.price.toLocaleString()}
                  </p>
                  <span className="flex items-center gap-1 text-gold font-inter text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative aspect-[4/5] w-full rounded-[var(--ios-radius-xl)] border border-[var(--ios-glass-border)] bg-surface flex items-center justify-center">
              <p className="font-playfair text-lg text-muted text-center px-8">
                New work is being curated for the gallery.
              </p>
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   THE COLLECTION — real approved paintings, newest
   first. Loading / error / empty handled explicitly.
   ──────────────────────────────────────────────── */
function CollectionSection({
  paintings,
  isLoading,
  isError,
  refetch,
}: {
  paintings: PaintingListDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) {
  return (
    <section className="py-24 sm:py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gold" />
              <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-gold">The Collection</span>
            </div>
            <h2 className="font-playfair text-4xl lg:text-5xl text-cream leading-tight">
              Recently added to<br />the gallery.
            </h2>
          </div>
          <Link
            href="/gallery"
            className="group flex items-center gap-2 font-inter text-[11px] uppercase tracking-widest text-gold hover:text-gold-hover transition-colors"
          >
            View all in the Gallery
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[var(--ios-radius-xl)] skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">Something went wrong</p>
            <p className="font-inter text-sm text-muted mb-6">We couldn&apos;t load the collection. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : paintings.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">No original works are live yet</p>
            <p className="font-inter text-sm text-muted mb-6">
              Approved paintings will appear here as artists join the collection.
            </p>
            <Link
              href="/auth/register"
              className="inline-block font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
            >
              Submit Your Work
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paintings.map((painting, i) => (
              <AnimatedSection key={painting.id} delay={i * 0.06}>
                <PaintingCard
                  id={painting.id}
                  title={painting.title}
                  slug={painting.slug}
                  price={painting.price}
                  currency={painting.currency}
                  primaryImageUrl={painting.primaryImageUrl || FALLBACK_PAINTING_IMAGE}
                  thumbnailUrl={painting.thumbnailUrl || undefined}
                  artist={{
                    displayName: painting.artistName,
                    slug: painting.artistSlug,
                    country: painting.countryName || '',
                  }}
                  medium={painting.mediumName || ''}
                  category={painting.categoryName || ''}
                  isOfferEnabled={painting.isOfferEnabled}
                />
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   MANIFESTO — brand voice pull-quote + one real
   painting. No fabricated statistics.
   ──────────────────────────────────────────────── */
function ManifestoSection({ image }: { image: string | null }) {
  return (
    <section className="py-24 sm:py-28 px-6 border-y border-border overflow-x-hidden">
      <div className={`max-w-7xl mx-auto grid grid-cols-1 ${image ? 'lg:grid-cols-2' : ''} gap-16 items-center`}>
        <AnimatedSection direction="left">
          <div className="font-playfair text-[80px] lg:text-[100px] leading-none text-gold/10 font-bold select-none mb-2">
            &ldquo;
          </div>
          <blockquote className="font-playfair italic text-3xl lg:text-4xl text-cream leading-[1.4] -mt-10">
            Original art, made accessible — one independent artist at a time.
          </blockquote>
          <div className="w-12 h-px bg-gold mt-8 mb-4" />
          <p className="font-inter text-[11px] uppercase tracking-widest text-muted">— The Artkezai Manifesto</p>
        </AnimatedSection>

        {image && (
          <AnimatedSection direction="right" delay={0.15}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--ios-radius-xl)] border border-[var(--ios-glass-border)] shadow-[var(--ios-shadow-lg)]">
              <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   THE ARTISTS — real names/countries derived from
   real painting data, not a fabricated roster.
   ──────────────────────────────────────────────── */
function ArtistsSection({ artists }: { artists: ArtistSummary[] }) {
  return (
    <section className="py-24 sm:py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gold" />
              <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-gold">The Artists</span>
            </div>
            <h2 className="font-playfair text-4xl lg:text-5xl text-cream leading-tight">
              The people behind<br />the paintings.
            </h2>
          </div>
          <Link
            href="/artists"
            className="group flex items-center gap-2 font-inter text-[11px] uppercase tracking-widest text-gold hover:text-gold-hover transition-colors"
          >
            View all artists
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {artists.map((artist, i) => (
            <AnimatedSection key={artist.slug} delay={i * 0.08}>
              <Link
                href={`/artists/${artist.slug}`}
                className="group block bg-surface border border-[var(--ios-glass-border)] rounded-[var(--ios-radius-xl)] overflow-hidden shadow-[var(--ios-shadow-sm)] hover:shadow-[var(--ios-shadow-lg)] transition-shadow duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-playfair text-base text-cream truncate">{artist.name}</h3>
                  {artist.country && (
                    <p className="font-inter text-[10px] uppercase tracking-widest text-muted mt-1">{artist.country}</p>
                  )}
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   PROCESS — three honest steps, no unverified
   fulfillment/shipping promises.
   ──────────────────────────────────────────────── */
function ProcessSection() {
  const steps = [
    { num: '01', title: 'Discover', desc: 'Browse original paintings by category, medium, price, and origin. Every listing is reviewed before it appears in the gallery.' },
    { num: '02', title: 'Offer or Buy', desc: 'Purchase at the listed price, or send the artist an offer directly.' },
    { num: '03', title: 'Own It', desc: 'Once accepted, the piece is yours — arranged directly with the artist.' },
  ];

  return (
    <section className="py-24 sm:py-28 px-6 border-t border-border bg-dark">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-gold" />
            <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-gold">The Process</span>
          </div>
          <h2 className="font-playfair text-4xl lg:text-6xl text-cream leading-tight max-w-xl">
            Three steps to owning original art.
          </h2>
        </AnimatedSection>

        <div className="divide-y divide-border">
          {steps.map((step, i) => (
            <AnimatedSection key={step.num} delay={i * 0.08}>
              <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[100px_1fr] items-baseline gap-6 sm:gap-12 py-8">
                <span className="font-playfair text-4xl sm:text-5xl font-bold text-border leading-none">{step.num}</span>
                <div>
                  <h3 className="font-playfair text-2xl text-cream mb-2">{step.title}</h3>
                  <p className="font-inter text-[14px] text-muted leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/how-it-works" className="font-inter text-[11px] uppercase tracking-widest text-gold hover:text-gold-hover transition-colors">
            Learn more about the process →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   CLOSING CTA
   ──────────────────────────────────────────────── */
function ClosingCTA({ image }: { image: string | null }) {
  return (
    <section className="relative py-32 sm:py-40 px-6 overflow-hidden bg-dark border-t border-border">
      {image && (
        <>
          <div className="absolute inset-0 opacity-[0.14]">
            <Image src={image} alt="" fill className="object-cover" sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/85 to-dark" />
        </>
      )}

      <AnimatedSection className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="font-playfair text-5xl lg:text-7xl text-cream leading-[1.02] mb-6">
          Begin your <span className="text-gold">collection.</span>
        </h2>
        <p className="font-inter text-[15px] text-muted leading-relaxed mb-10 max-w-lg mx-auto">
          Original paintings from independent artists around the world.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/gallery"
            className="group ios-button-primary flex items-center justify-center gap-2 font-inter text-[11px] uppercase tracking-[0.08em] px-10 py-5"
          >
            Explore the Gallery
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/auth/register"
            className="ios-button-secondary flex items-center justify-center font-inter text-[11px] uppercase tracking-[0.08em] px-10 py-5"
          >
            Join as an Artist
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ────────────────────────────────────────────────
   PAGE ROOT
   ──────────────────────────────────────────────── */
export default function HomePage() {
  const { data: galleryPage, isLoading, isError, refetch } = usePaintings({}, 1, 'newest');

  const paintings = galleryPage?.data ?? [];
  const totalCount = galleryPage?.totalCount ?? 0;

  const heroPainting = paintings.find((p) => p.primaryImageUrl) ?? paintings[0] ?? null;
  const collectionPaintings = paintings.slice(0, 6);

  const artistMap = new Map<string, ArtistSummary>();
  paintings.forEach((p) => {
    if (!artistMap.has(p.artistSlug)) {
      artistMap.set(p.artistSlug, {
        name: p.artistName,
        slug: p.artistSlug,
        country: p.countryName || '',
        image: p.primaryImageUrl || FALLBACK_PAINTING_IMAGE,
      });
    }
  });
  const artists = Array.from(artistMap.values()).slice(0, 4);

  const manifestoImage =
    paintings.slice(1).find((p) => p.primaryImageUrl)?.primaryImageUrl ?? heroPainting?.primaryImageUrl ?? null;
  const closingImage =
    paintings.slice(2).find((p) => p.primaryImageUrl)?.primaryImageUrl ?? heroPainting?.primaryImageUrl ?? null;

  return (
    <>
      <Hero painting={heroPainting} totalCount={totalCount} />
      <CollectionSection
        paintings={collectionPaintings}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
      />
      <ManifestoSection image={manifestoImage} />
      {artists.length >= 2 && <ArtistsSection artists={artists} />}
      <ProcessSection />
      <ClosingCTA image={closingImage} />
    </>
  );
}
