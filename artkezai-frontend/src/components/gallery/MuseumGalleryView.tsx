'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';

/* ── Types ── */
export interface MuseumPainting {
  id: string;
  title: string;
  slug: string;
  price: number;
  medium: string;
  image: string;
  year?: string;
  dimensions?: string;
}

export interface MuseumArtist {
  name: string;
  country: string;
  bio: string;
  image: string;
}

interface Props {
  paintings: MuseumPainting[];
  artist: MuseumArtist;
}

/* ── Vertical offset pattern — gives the organic gallery-hang feel ── */
const HANG_OFFSETS = [0, 24, -12, 32, 8, -20, 16, -8, 28];

/* ════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function MuseumGalleryView({ paintings, artist }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      {/* ── Museum Wall ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: '#080808',
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)',
          minHeight: '600px',
        }}
      >
        {/* Ceiling light strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 70%, transparent)',
            filter: 'blur(1px)',
          }}
        />

        {/* Wall grain texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        {/* Paintings row */}
        <div className="relative flex flex-wrap justify-center gap-10 px-8 pt-16 pb-24">
          {paintings.map((painting, i) => (
            <FramedArtwork
              key={painting.id}
              painting={painting}
              index={i}
              offset={HANG_OFFSETS[i % HANG_OFFSETS.length]}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>

        {/* Floor */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background:
              'linear-gradient(0deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 40%, transparent 100%)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        />

        {/* Floor reflection line */}
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            left: '5%',
            right: '5%',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent)',
          }}
        />
      </div>

      {/* ── Full-Screen Museum Modal ── */}
      <AnimatePresence>
        {activeIndex !== null && (
          <ArtworkMuseumModal
            paintings={paintings}
            artist={artist}
            activeIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            onNavigate={setActiveIndex}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ════════════════════════════════════════════
   FRAMED ARTWORK (wall card)
═══════════════════════════════════════════ */
function FramedArtwork({
  painting,
  index,
  offset,
  onClick,
}: {
  painting: MuseumPainting;
  index: number;
  offset: number;
  onClick: () => void;
}) {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, visible: false });
  const frameRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y, visible: true });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ marginTop: `${offset}px` }}
      className="flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Hanging wire */}
      <div
        style={{
          width: '1px',
          height: '32px',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.35) 60%, rgba(255,255,255,0.5) 100%)',
          marginBottom: '0px',
          position: 'relative',
        }}
      >
        {/* Nail dot */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            boxShadow: '0 0 4px rgba(255,255,255,0.3)',
          }}
        />
      </div>

      {/* Frame wrapper */}
      <div
        ref={frameRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setSpotlight((s) => ({ ...s, visible: false }))}
        style={{
          position: 'relative',
          width: '240px',
          padding: '10px',
          background: '#1a1614',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: spotlight.visible
            ? '0 68px 56px -41px rgba(0,0,0,0.55), 0 28px 64px 0 rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)'
            : '0 48px 40px -30px rgba(0,0,0,0.4), 0 18px 48px 0 rgba(0,0,0,0.6)',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {/* Outer frame decorative border */}
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            border: '1px solid rgba(255,255,255,0.06)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Mat (cream interior border) */}
        <div
          style={{
            background: '#f0ece4',
            padding: '8px',
            position: 'relative',
          }}
        >
          {/* Artwork image */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', overflow: 'hidden' }}>
            <Image
              src={painting.image}
              alt={painting.title}
              fill
              className="object-cover"
              style={{
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: spotlight.visible ? 'scale(1.04)' : 'scale(1)',
              }}
              sizes="240px"
            />

            {/* Spotlight overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: spotlight.visible
                  ? `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)`
                  : 'transparent',
                transition: 'background 0.2s ease',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Ambient light glow (ceiling spot) */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '60px',
            background: spotlight.visible
              ? 'radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)',
            transition: 'background 0.4s ease',
            pointerEvents: 'none',
          }}
        />

        {/* View overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: spotlight.visible ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.0)',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}
          >
            View in Museum
          </div>
        </motion.div>
      </div>

      {/* Museum placard */}
      <div
        style={{
          marginTop: '12px',
          textAlign: 'center',
          maxWidth: '240px',
        }}
      >
        {/* Title plate */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 14px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.92)',
              marginBottom: '4px',
              letterSpacing: '0.01em',
            }}
          >
            {painting.title}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-inter, sans-serif)',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            {painting.medium}
            {painting.year ? ` · ${painting.year}` : ''}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: '12px',
              color: 'rgba(201, 168, 76, 0.9)',
              letterSpacing: '0.02em',
            }}
          >
            ${painting.price.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   FULL-SCREEN MUSEUM MODAL
═══════════════════════════════════════════ */
function ArtworkMuseumModal({
  paintings,
  artist,
  activeIndex,
  onClose,
  onNavigate,
}: {
  paintings: MuseumPainting[];
  artist: MuseumArtist;
  activeIndex: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const painting = paintings[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < paintings.length - 1;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(activeIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(activeIndex + 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, hasPrev, hasNext, onClose, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(54.66% 50% at 50% 50%, rgba(58,50,45,0.85) 0%, rgba(0,0,0,0.96) 100%)',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto',
        padding: '24px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9100,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(90deg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(0deg)';
        }}
      >
        <X size={18} />
      </button>

      {/* Navigation: Previous */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(activeIndex - 1)}
          style={{
            position: 'fixed',
            left: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9100,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')
          }
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Navigation: Next */}
      {hasNext && (
        <button
          onClick={() => onNavigate(activeIndex + 1)}
          style={{
            position: 'fixed',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9100,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')
          }
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Main content */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '56px',
          maxWidth: '1100px',
          width: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* ── Framed Artwork ── */}
        <div style={{ flexShrink: 0 }}>
          {/* Ceiling spotlight beam */}
          <div
            style={{
              width: '2px',
              height: '48px',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%)',
              margin: '0 auto 0',
            }}
          />

          {/* Frame */}
          <div
            style={{
              padding: '14px',
              background: '#1a1614',
              border: '2px solid rgba(255,255,255,0.15)',
              boxShadow:
                '0 68px 56px -41px rgba(0,0,0,0.4), 0 28px 64px 0 rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
              maxWidth: '420px',
              width: 'clamp(260px, 38vw, 420px)',
            }}
          >
            {/* Outer decorative line */}
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                border: '1px solid rgba(255,255,255,0.05)',
                pointerEvents: 'none',
              }}
            />
            {/* Mat */}
            <div style={{ background: '#f0ece4', padding: '10px' }}>
              <div style={{ position: 'relative', aspectRatio: '4/5' }}>
                <Image
                  src={painting.image}
                  alt={painting.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 420px"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Glow beneath frame */}
          <div
            style={{
              height: '40px',
              background:
                'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 80%)',
              marginTop: '0',
            }}
          />
        </div>

        {/* ── Info Panel ── */}
        <div
          style={{
            maxWidth: '340px',
            width: '100%',
          }}
        >
          {/* Epoch number */}
          <p
            style={{
              fontFamily: 'var(--font-inter, sans-serif)',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.7)',
              marginBottom: '12px',
            }}
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(paintings.length).padStart(2, '0')}
          </p>

          {/* Title */}
          <h2
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: 'clamp(24px, 3.75vw, 42px)',
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            {painting.title}
          </h2>

          {/* Medium + year */}
          <p
            style={{
              fontFamily: 'var(--font-inter, sans-serif)',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em',
              marginBottom: '24px',
              fontWeight: 300,
            }}
          >
            {painting.medium}
            {painting.year ? ` · ${painting.year}` : ''}
            {painting.dimensions ? ` · ${painting.dimensions}` : ''}
          </p>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04) 80%, transparent)',
              marginBottom: '24px',
            }}
          />

          {/* Artist mini-card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.15)',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <Image src={artist.image} alt={artist.name} fill className="object-cover" sizes="40px" />
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-inter, sans-serif)',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: '-0.01em',
                  marginBottom: '2px',
                }}
              >
                {artist.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <p
                  style={{
                    fontFamily: 'var(--font-inter, sans-serif)',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {artist.country}
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <p
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: '28px',
              color: 'rgba(201,168,76,0.95)',
              marginBottom: '24px',
              letterSpacing: '0.01em',
            }}
          >
            ${painting.price.toLocaleString()}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href={`/painting/${painting.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: '#fff',
                color: '#000',
                fontFamily: 'var(--font-inter, sans-serif)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.9)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#fff';
              }}
            >
              <ExternalLink size={13} />
              View Full Details
            </Link>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 24px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontFamily: 'var(--font-inter, sans-serif)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.4)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.95)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              Make an Offer
            </button>
          </div>

          {/* Dot navigation */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '32px', justifyContent: 'center' }}>
            {paintings.map((_, i) => (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                style={{
                  width: i === activeIndex ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background:
                    i === activeIndex ? 'rgba(201,168,76,0.9)' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.35s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Keyboard hint */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          pointerEvents: 'none',
        }}
      >
        {[
          { key: '←', label: 'Previous' },
          { key: 'ESC', label: 'Close' },
          { key: '→', label: 'Next' },
        ].map(({ key, label }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: 0.35,
            }}
          >
            <span
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontFamily: 'var(--font-inter, sans-serif)',
                fontSize: '10px',
                color: '#fff',
                letterSpacing: '0.05em',
              }}
            >
              {key}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter, sans-serif)',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
