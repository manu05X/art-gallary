'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  MessageSquare,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

/* ── Static painting data (mirrors gallery page) ── */
const paintings = [
  {
    id: '1',
    slug: 'amber-reverie',
    title: 'Amber Reverie',
    price: 1200,
    currency: 'USD',
    artistName: 'Elena Morozova',
    artistSlug: 'elena-morozova',
    artistBio:
      'Elena Morozova is a Moscow-born abstract painter whose work explores the intersection of memory and light. Her bold use of amber tones has become a signature across her celebrated series.',
    medium: 'Oil on Canvas',
    category: 'Abstract',
    width: 90,
    height: 120,
    yearCreated: 2023,
    country: 'Russia',
    orientation: 'Portrait',
    description:
      'A luminous exploration of memory and warmth. Amber Reverie was painted over three months in natural light, each layer adding depth to the amber glow at its centre.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    id: '2',
    slug: 'twilight-over-the-valley',
    title: 'Twilight Over the Valley',
    price: 2400,
    currency: 'USD',
    artistName: 'James Whitfield',
    artistSlug: 'james-whitfield',
    artistBio:
      'James Whitfield is a landscape painter based in New Mexico. His work captures the fleeting light of the American Southwest, earning recognition in galleries from Santa Fe to London.',
    medium: 'Acrylic on Canvas',
    category: 'Landscape',
    width: 120,
    height: 80,
    yearCreated: 2022,
    country: 'United States',
    orientation: 'Landscape',
    description:
      'Painted at golden hour in the foothills of New Mexico, Twilight Over the Valley captures the moment when day surrenders to dusk. The layered purples and golds reflect masterful atmospheric perspective.',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: '3',
    slug: 'silent-conversation',
    title: 'Silent Conversation',
    price: 800,
    currency: 'USD',
    artistName: 'Priya Sharma',
    artistSlug: 'priya-sharma',
    artistBio:
      'Priya Sharma is a portrait watercolourist from Mumbai whose intimate studies of human connection have been exhibited across South Asia and Europe.',
    medium: 'Watercolor',
    category: 'Portrait',
    width: 50,
    height: 70,
    yearCreated: 2024,
    country: 'India',
    orientation: 'Portrait',
    description:
      'Two figures, no words — just the quiet language of proximity. Painted in a single sitting, Silent Conversation captures the unspoken bond between two people lost in shared thought.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    id: '4',
    slug: 'golden-hour-fields',
    title: 'Golden Hour Fields',
    price: 3100,
    currency: 'USD',
    artistName: 'James Whitfield',
    artistSlug: 'james-whitfield',
    artistBio:
      'James Whitfield is a landscape painter based in New Mexico. His work captures the fleeting light of the American Southwest.',
    medium: 'Oil on Canvas',
    category: 'Landscape',
    width: 150,
    height: 100,
    yearCreated: 2023,
    country: 'United States',
    orientation: 'Landscape',
    description:
      'An expansive field of wheat bathed in the last warmth of a summer evening. Golden Hour Fields is among the most celebrated works, praised for evoking both scale and intimacy simultaneously.',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: '5',
    slug: 'fractured-light',
    title: 'Fractured Light',
    price: 1800,
    currency: 'USD',
    artistName: 'Elena Morozova',
    artistSlug: 'elena-morozova',
    artistBio:
      'Elena Morozova is a Moscow-born abstract painter whose work explores the intersection of memory and light.',
    medium: 'Mixed Media',
    category: 'Abstract',
    width: 100,
    height: 100,
    yearCreated: 2024,
    country: 'Russia',
    orientation: 'Square',
    description:
      'Light breaking through a prism — Fractured Light uses collage, oil, and gold leaf to explore the moment of perception. Each viewing angle reveals a different composition.',
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    id: '6',
    slug: 'the-red-door',
    title: 'The Red Door',
    price: 950,
    currency: 'USD',
    artistName: 'Priya Sharma',
    artistSlug: 'priya-sharma',
    artistBio:
      'Priya Sharma is a portrait watercolourist from Mumbai whose intimate studies of human connection have been exhibited across South Asia and Europe.',
    medium: 'Acrylic on Canvas',
    category: 'Still Life',
    width: 60,
    height: 80,
    yearCreated: 2022,
    country: 'India',
    orientation: 'Portrait',
    description:
      'A solitary red door set in a whitewashed alley — ordinary architecture rendered extraordinary. The Red Door turns a mundane threshold into a symbol of possibility.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    id: '7',
    slug: 'whispers-of-dawn',
    title: 'Whispers of Dawn',
    price: 2200,
    currency: 'USD',
    artistName: 'Elena Morozova',
    artistSlug: 'elena-morozova',
    artistBio:
      'Elena Morozova is a Moscow-born abstract painter whose work explores the intersection of memory and light.',
    medium: 'Oil on Canvas',
    category: 'Abstract',
    width: 110,
    height: 140,
    yearCreated: 2023,
    country: 'Russia',
    orientation: 'Portrait',
    description:
      'The stillness of early morning — Whispers of Dawn layers translucent oils to build a canvas that seems to breathe. The pale golds and slate blues shift depending on where light falls.',
    image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    id: '8',
    slug: 'solitude',
    title: 'Solitude',
    price: 1450,
    currency: 'USD',
    artistName: 'James Whitfield',
    artistSlug: 'james-whitfield',
    artistBio:
      'James Whitfield is a landscape painter based in New Mexico. His work captures the fleeting light of the American Southwest.',
    medium: 'Watercolor',
    category: 'Landscape',
    width: 70,
    height: 50,
    yearCreated: 2022,
    country: 'United States',
    orientation: 'Landscape',
    description:
      'A single tree against a vast sky — Solitude distills landscape painting to its essence. The watercolour technique allows the paper to breathe through each wash, giving the sky unmatched luminosity.',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: '9',
    slug: 'urban-pulse',
    title: 'Urban Pulse',
    price: 3400,
    currency: 'USD',
    artistName: 'Priya Sharma',
    artistSlug: 'priya-sharma',
    artistBio:
      'Priya Sharma is a portrait watercolourist from Mumbai whose intimate studies of human connection have been exhibited across South Asia and Europe.',
    medium: 'Mixed Media',
    category: 'Abstract',
    width: 130,
    height: 130,
    yearCreated: 2024,
    country: 'India',
    orientation: 'Square',
    description:
      'The energy of Mumbai at rush hour — Urban Pulse translates the chaos and rhythm of city life into a controlled explosion of mark-making, ink, and collaged street ephemera.',
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80',
    artistImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
];

export default function PaintingPage({ params }: { params: { slug: string } }) {
  const painting = paintings.find((p) => p.slug === params.slug) ?? null;
  const [showOffer, setShowOffer] = useState(false);

  if (!painting) {
    return (
      <div className="bg-[var(--color-dark)] min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ios-card p-10 text-center max-w-md"
        >
          <p className="font-playfair text-2xl text-[var(--color-cream)] mb-4">Painting not found</p>
          <p className="font-inter text-sm text-[var(--color-muted)] mb-6">
            The painting you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 ios-button-secondary font-inter text-xs uppercase tracking-widest px-6 py-3"
          >
            <ArrowLeft size={16} />
            Back to Gallery
          </Link>
        </motion.div>
      </div>
    );
  }

  const related = paintings
    .filter((p) => p.category === painting.category && p.slug !== painting.slug)
    .slice(0, 4);

  return (
    <div className="bg-[var(--color-dark)] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
          >
            <ArrowLeft size={13} />
            Gallery
          </Link>
          <span className="text-[var(--color-border)] text-xs">/</span>
          <span className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-cream)] truncate max-w-[200px]">
            {painting.title}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">

          {/* LEFT — Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="relative w-full aspect-[4/5] bg-[var(--color-surface)] overflow-hidden group rounded-[var(--ios-radius-xl)] border border-[var(--color-border)]">
              <Image
                src={painting.image}
                alt={painting.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-4 border border-[color-mix(in_srgb,var(--color-gold)_30%,transparent)] pointer-events-none" />
              <div className="absolute top-6 left-6 bg-[color-mix(in_srgb,var(--color-dark)_84%,transparent)] backdrop-blur-sm border border-[var(--color-border)] px-3 py-1.5 rounded-full">
                <span className="font-inter text-[10px] uppercase tracking-widest text-[var(--color-gold)]">
                  {painting.category}
                </span>
              </div>
            </div>

            {/* About this painting */}
            <AnimatedSection delay={0.3} className="mt-12">
              <h2 className="font-playfair text-2xl text-[var(--color-cream)] mb-5">About this Painting</h2>
              <p className="font-inter text-[15px] text-[var(--color-muted)] leading-8">
                {painting.description}
              </p>
            </AnimatedSection>
          </motion.div>

          {/* RIGHT — Sticky info panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:h-fit"
          >
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl text-[var(--color-cream)] leading-tight mb-3">
                  {painting.title}
                </h1>
                <Link
                  href={`/artists/${painting.artistSlug}`}
                  className="font-inter text-sm text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
                >
                  by <span className="font-semibold">{painting.artistName}</span>
                </Link>
              </div>

              <div className="h-px bg-[var(--color-border)]" />

              {/* Price */}
              <div>
                <p className="font-playfair text-4xl text-[var(--color-gold)] mb-1">
                  ${painting.price.toLocaleString()}
                </p>
                <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                  {painting.currency} · or make an offer
                </p>
              </div>

              {/* Metadata */}
              <div className="space-y-3 py-6 border-y border-[var(--color-border)]">
                <MetaRow label="Medium" value={painting.medium} />
                <MetaRow label="Dimensions" value={`${painting.width} × ${painting.height} cm`} />
                <MetaRow label="Year" value={String(painting.yearCreated)} />
                <MetaRow label="Origin" value={painting.country} />
                <MetaRow label="Orientation" value={painting.orientation} />
                <MetaRow label="Category" value={painting.category} />
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button className="w-full ios-button-primary font-playfair uppercase tracking-widest text-sm py-4 flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  Buy Now
                </button>
                <button
                  onClick={() => setShowOffer(true)}
                  className="w-full ios-button-secondary font-playfair uppercase tracking-widest text-sm py-4 flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Make an Offer
                </button>
                <button className="w-full border border-[var(--color-border)] text-[var(--color-muted)] font-inter text-xs uppercase tracking-widest py-3 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors flex items-center justify-center gap-2 rounded-full">
                  <MessageSquare size={16} />
                  Message Gallery
                </button>
              </div>

              {/* Trust signals */}
              <div className="space-y-3 pt-4 border-t border-[var(--color-border)] text-xs">
                <div className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Shield size={15} className="text-[var(--color-gold)] shrink-0" />
                  Secure checkout — all transactions protected
                </div>
                <div className="flex items-center gap-2 text-[var(--color-muted)]">
                  <RotateCcw size={15} className="text-[var(--color-gold)] shrink-0" />
                  Certificate of authenticity included
                </div>
                <div className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Truck size={15} className="text-[var(--color-gold)] shrink-0" />
                  Professional art shipping arranged
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* About the Artist */}
      <section className="border-t border-[var(--color-border)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <div className="relative h-80 overflow-hidden group rounded-[var(--ios-radius-xl)] border border-[var(--color-border)]">
                <Image
                  src={painting.artistImage}
                  alt={painting.artistName}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="font-playfair text-3xl text-[var(--color-cream)] mb-2">
                  {painting.artistName}
                </h2>
                <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)] mb-6">
                  From {painting.country}
                </p>
                <p className="font-inter text-[15px] text-[var(--color-muted)] leading-8 mb-8">
                  {painting.artistBio}
                </p>
                <Link
                  href={`/artists/${painting.artistSlug}`}
                  className="inline-flex items-center gap-2 ios-button-secondary font-inter text-xs uppercase tracking-widest px-6 py-3"
                >
                  View Artist Profile →
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Related Paintings */}
      {related.length > 0 && (
        <section className="bg-gradient-to-b from-[var(--color-dark)] to-[var(--color-surface)] border-t border-[var(--color-border)] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection delay={0.1}>
              <h2 className="font-playfair text-3xl text-[var(--color-cream)] mb-10">You Might Also Like</h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rel, i) => (
                <AnimatedSection key={rel.id} delay={i * 0.1}>
                  <Link href={`/painting/${rel.slug}`}>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden group cursor-pointer rounded-[var(--ios-radius-lg)]">
                      <div className="relative w-full aspect-[3/4] overflow-hidden">
                        <Image
                          src={rel.image}
                          alt={rel.title}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      </div>
                      <div className="p-4 space-y-1">
                        <h3 className="font-playfair text-sm text-[var(--color-cream)]">{rel.title}</h3>
                        <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                          {rel.artistName}
                        </p>
                        <p className="font-inter text-sm text-[var(--color-gold)]">
                          ${rel.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Make an Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--ios-radius-xl)] p-8 w-full max-w-md"
          >
            <h3 className="font-playfair text-2xl text-[var(--color-cream)] mb-2">Make an Offer</h3>
            <p className="font-inter text-sm text-[var(--color-muted)] mb-6">
              Listed at{' '}
              <span className="text-[var(--color-gold)]">${painting.price.toLocaleString()}</span>
            </p>
            <input
              type="number"
              placeholder="Your offer (USD)"
              className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] font-inter text-sm px-4 py-3 mb-4 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-[14px]"
            />
            <textarea
              placeholder="Message to the gallery (optional)"
              rows={3}
              className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] font-inter text-sm px-4 py-3 mb-6 focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none rounded-[14px]"
            />
            <div className="flex gap-3">
              <button className="flex-1 ios-button-primary font-playfair uppercase tracking-widest text-sm py-3">
                Submit Offer
              </button>
              <button
                onClick={() => setShowOffer(false)}
                className="flex-1 border border-[var(--color-border)] text-[var(--color-muted)] font-inter text-xs uppercase tracking-widest py-3 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors rounded-full"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2">
      <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-subtle)]">{label}</p>
      <p className="font-inter text-sm text-[var(--color-cream)]">{value}</p>
    </div>
  );
}
