'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Shield, Truck, CreditCard, ArrowRight, ArrowUpRight } from 'lucide-react';

/* ────────────────────────────────────────────────
   CUSTOM CURSOR
   ──────────────────────────────────────────────── */
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);

    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    const lerp = () => {
      ringRef.current.x += (pos.x - ringRef.current.x) * 0.12;
      ringRef.current.y += (pos.y - ringRef.current.y) * 0.12;
      setRing({ x: ringRef.current.x, y: ringRef.current.y });
      rafRef.current = requestAnimationFrame(lerp);
    };
    rafRef.current = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [pos.x, pos.y]);

  return (
    <>
      {/* Dot */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-full bg-[#C9A84C] transition-transform duration-100"
        style={{
          left: pos.x - 4,
          top: pos.y - 4,
          width: 8,
          height: 8,
          transform: hovered ? 'scale(0)' : 'scale(1)',
        }}
      />
      {/* Ring */}
      <div
        className="fixed z-[9998] pointer-events-none rounded-full border border-[#C9A84C] transition-all duration-200"
        style={{
          left: ring.x - (hovered ? 24 : 16),
          top: ring.y - (hovered ? 24 : 16),
          width: hovered ? 48 : 32,
          height: hovered ? 48 : 32,
          opacity: hovered ? 0.6 : 0.4,
        }}
      />
    </>
  );
}

/* ────────────────────────────────────────────────
   GRAIN OVERLAY
   ──────────────────────────────────────────────── */
function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

/* ────────────────────────────────────────────────
   HERO — Cosmos-style orbital animation

   Pure CSS animation approach (no imperative animate() API):
   1. Cards start CLUSTERED AT CENTER via CSS custom property offsets
   2. `.burst` class triggers @keyframes that fly them outward
   3. After burst completes → swap to `.drift` class for gentle perpetual float

   This avoids the framer-motion v10 bug where animate() on motion.div
   elements silently fails because it conflicts with the component's
   internal transform management.
   ──────────────────────────────────────────────── */

const CARDS = [
  // lp/tp = final position (% of viewport), w/h = size, rot = tilt degrees
  // driftX/driftY = float amplitude, driftDur = float period, stagger = burst delay
  { src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80', w: 168, h: 222, lp: 3,  tp: 6,  rot: -34, driftX: 5,   driftY: 10,  driftDur: 4.6, stagger: 0.00 },
  { src: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=500&q=80', w: 145, h: 192, lp: 24, tp: 2,  rot: -6,  driftX: -4,  driftY: 8,   driftDur: 5.2, stagger: 0.05 },
  { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=500&q=80', w: 152, h: 200, lp: 57, tp: 1,  rot: 9,   driftX: 6,   driftY: -11, driftDur: 4.9, stagger: 0.10 },
  { src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&q=80', w: 158, h: 208, lp: 74, tp: 7,  rot: -27, driftX: -5,  driftY: 9,   driftDur: 5.5, stagger: 0.05 },
  { src: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80', w: 175, h: 232, lp: 83, tp: 35, rot: 22,  driftX: 7,   driftY: -12, driftDur: 4.3, stagger: 0.10 },
  { src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&q=80', w: 162, h: 214, lp: 64, tp: 63, rot: -16, driftX: -6,  driftY: 8,   driftDur: 5.0, stagger: 0.05 },
  { src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80', w: 148, h: 196, lp: 40, tp: 70, rot: 19,  driftX: 5,   driftY: -10, driftDur: 4.7, stagger: 0.10 },
  { src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&q=80', w: 155, h: 205, lp: 20, tp: 72, rot: -9,  driftX: -4,  driftY: 11,  driftDur: 5.4, stagger: 0.05 },
  { src: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=500&q=80', w: 165, h: 218, lp: 2,  tp: 32, rot: -21, driftX: 6,   driftY: -9,  driftDur: 4.9, stagger: 0.10 },
  { src: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=500&q=80', w: 160, h: 212, lp: 3,  tp: 60, rot: 14,  driftX: -5,  driftY: 10,  driftDur: 5.3, stagger: 0.05 },
];

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<'init' | 'burst' | 'drift'>('init');
  const [offsets, setOffsets] = useState<{ x: string; y: string }[]>([]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY       = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Calculate offsets from each card's position to viewport center
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const computed = CARDS.map((c) => {
      // Card center in px
      const cardCenterX = (c.lp / 100) * vw + c.w / 2;
      const cardCenterY = (c.tp / 100) * vh + c.h / 2;
      // Offset to move card TO viewport center
      const ox = vw / 2 - cardCenterX;
      const oy = vh / 2 - cardCenterY;
      return { x: `${ox}px`, y: `${oy}px` };
    });

    setOffsets(computed);

    // Small delay then trigger burst
    const t1 = setTimeout(() => setPhase('burst'), 150);
    // After burst animation completes (~1.7s), switch to drift
    const t2 = setTimeout(() => setPhase('drift'), 1900);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const lines = [
    { text: 'Your space',   gold: false },
    { text: 'for original', gold: false },
    { text: 'art.',         gold: true  },
  ];

  const TEXT_START = 1.5;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-[#080808]"
      style={{ cursor: 'none', overflow: 'clip' }}
    >
      {/* ── LAYER 1: Orbital painting cards ── */}
      {CARDS.map((c, i) => (
        <div
          key={i}
          className={`orbital-card absolute overflow-hidden cursor-pointer ${phase}`}
          style={{
            left:           `${c.lp}%`,
            top:            `${c.tp}%`,
            width:          c.w,
            height:         c.h,
            zIndex:         1,
            boxShadow:      '0 24px 64px rgba(0,0,0,0.75)',
            border:         '1px solid rgba(255,255,255,0.06)',
            '--offset-x':   offsets[i]?.x || '0px',
            '--offset-y':   offsets[i]?.y || '0px',
            '--card-rot':   `${c.rot}deg`,
            '--stagger':    `${c.stagger}s`,
            '--drift-x':    `${c.driftX}px`,
            '--drift-y':    `${c.driftY}px`,
            '--drift-dur':  `${c.driftDur}s`,
            '--drift-delay': `${i * 0.3}s`,
          } as React.CSSProperties}
        >
          <Image
            src={c.src}
            alt="Painting"
            fill
            className="object-cover"
            sizes={`${c.w}px`}
            priority={i < 6}
          />
        </div>
      ))}

      {/* ── LAYER 2: Cosmos-style vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            'radial-gradient(ellipse 55% 60% at 50% 50%,' +
            'rgba(8,8,8,0.92) 0%,'  +
            'rgba(8,8,8,0.70) 20%,' +
            'rgba(8,8,8,0.28) 42%,' +
            'rgba(8,8,8,0.08) 58%,' +
            'rgba(8,8,8,0.55) 75%,' +
            'rgba(8,8,8,0.90) 100%)',
        }}
      />

      {/* ── LAYER 3: Top/bottom fades ── */}
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b from-[#080808] to-transparent" style={{ zIndex: 3 }} />
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-[#080808] to-transparent" style={{ zIndex: 3 }} />

      {/* ── LAYER 10: Center text ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity, zIndex: 10 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: TEXT_START }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-10 h-px bg-[#C9A84C]/50" />
          <span className="font-inter text-[10px] uppercase tracking-[0.45em] text-[#C9A84C]">
            Original Paintings · Est. 2024
          </span>
          <div className="w-10 h-px bg-[#C9A84C]/50" />
        </motion.div>

        <h1 className="font-playfair leading-[1.06] pointer-events-none select-none">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 44, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, delay: TEXT_START + 0.2 + i * 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`block ${
                line.gold
                  ? 'italic text-[#C9A84C] text-[clamp(48px,7.5vw,106px)]'
                  : 'text-[#F5F0E8] text-[clamp(48px,7.5vw,106px)]'
              }`}
            >
              {line.text}
            </motion.div>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: TEXT_START + 0.9 }}
          className="font-inter text-[15px] text-[#8A8070] leading-relaxed max-w-sm mt-8 mb-12 pointer-events-none"
        >
          Discover, offer, and own original paintings from independent artists in 38 countries.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: TEXT_START + 1.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/gallery"
            className="group flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0F0F0F] font-inter text-[11px] uppercase tracking-[0.3em] px-9 py-4 hover:bg-[#d4b55a] transition-colors duration-300"
          >
            Enter the Gallery
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center justify-center border border-[#2E2A22] text-[#8A8070] font-inter text-[11px] uppercase tracking-[0.3em] px-9 py-4 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-all duration-300"
          >
            Join Free
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: TEXT_START + 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <span className="font-inter text-[9px] uppercase tracking-[0.4em] text-[#5A5548]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-[#C9A84C]/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   MARQUEE STRIP
   ──────────────────────────────────────────────── */
function MarqueeStrip() {
  const text = 'ORIGINAL PAINTINGS \u00A0·\u00A0 CERTIFICATE OF AUTHENTICITY \u00A0·\u00A0 WORLDWIDE ARTISTS \u00A0·\u00A0 CURATED SELECTION \u00A0·\u00A0 SECURE PAYMENTS \u00A0·\u00A0 ';
  return (
    <section className="bg-[#C9A84C] py-3.5 overflow-hidden">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap"
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="font-inter text-[11px] uppercase tracking-[0.2em] text-[#0F0F0F] font-medium">
            {text}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   EDITORIAL INTRO
   ──────────────────────────────────────────────── */
function EditorialSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 px-6 border-b border-[#2E2A22] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — pull quote */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="font-playfair text-[80px] lg:text-[110px] leading-none text-[#C9A84C]/10 font-bold select-none mb-4">
            "
          </div>
          <blockquote className="font-playfair italic text-3xl lg:text-4xl text-[#F5F0E8] leading-[1.4] -mt-12">
            Art should not live behind gallery walls that only a few can enter.
          </blockquote>
          <div className="w-12 h-px bg-[#C9A84C] mt-8 mb-4" />
          <p className="font-inter text-[11px] uppercase tracking-widest text-[#8A8070]">
            — The Artkezai Manifesto
          </p>
        </motion.div>

        {/* Right — painting stack */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative h-[480px]"
        >
          {[
            { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', rotate: -4, z: 0, x: 0, y: 20 },
            { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80', rotate: 2, z: 10, x: 30, y: 0 },
            { src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80', rotate: -1, z: 20, x: 60, y: 10 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute w-64 h-80 overflow-hidden border border-[#2E2A22] shadow-2xl"
              style={{ transform: `rotate(${p.rotate}deg) translateX(${p.x}px) translateY(${p.y}px)`, zIndex: p.z, left: i * 60 }}
            >
              <Image src={p.src} alt="Painting" fill className="object-cover" sizes="256px" />
            </div>
          ))}
          <div className="absolute bottom-0 right-0 bg-[#1A1710] border border-[#2E2A22] px-6 py-4 z-30">
            <p className="font-playfair text-2xl text-[#C9A84C]">2,400+</p>
            <p className="font-inter text-[10px] uppercase tracking-widest text-[#8A8070] mt-0.5">Original works</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   FEATURED GALLERY — Asymmetric masonry grid
   ──────────────────────────────────────────────── */
const paintings = [
  { title: 'Amber Reverie', artist: 'Elena Morozova', country: 'Russia', price: 1200, medium: 'Oil on Canvas', category: 'abstract', slug: 'amber-reverie', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80', tall: true },
  { title: 'Blue Solitude', artist: 'Marcus Weber', country: 'Germany', price: 890, medium: 'Acrylic', category: 'abstract', slug: 'fractured-light', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80', tall: false },
  { title: 'Morning Light', artist: 'Yuki Tanaka', country: 'Japan', price: 2400, medium: 'Watercolour', category: 'landscape', slug: 'twilight-over-the-valley', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80', tall: false },
  { title: 'Silent Echo', artist: 'Omar Hassan', country: 'Egypt', price: 1750, medium: 'Mixed Media', category: 'abstract', slug: 'urban-pulse', image: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=600&q=80', tall: true },
  { title: 'The Observer', artist: 'Chen Wei', country: 'China', price: 3200, medium: 'Oil on Board', category: 'portrait', slug: 'silent-conversation', image: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=600&q=80', tall: false },
  { title: 'Crimson Fields', artist: 'Isabella Chen', country: 'Taiwan', price: 380, medium: 'Watercolour', category: 'landscape', slug: 'the-red-door', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80', tall: false },
];

function PaintingCard({ painting, delay = 0 }: { painting: typeof paintings[number]; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/painting/${painting.slug}`}>
        <div
          className="group relative overflow-hidden bg-[#1A1710] border border-[#2E2A22] cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className={`relative overflow-hidden ${painting.tall ? 'aspect-[3/4]' : 'aspect-square'}`}>
            <Image
              src={painting.image}
              alt={painting.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Warm glow on hover */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(ellipse at 50% 80%, rgba(201,168,76,0.12) 0%, transparent 70%)',
                opacity: hovered ? 1 : 0,
              }}
            />
            {/* Hover info overlay */}
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F0F0F]/95 to-transparent p-5 transition-all duration-500"
              style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-inter text-[10px] uppercase tracking-widest text-[#8A8070]">{painting.medium}</p>
                  <p className="font-playfair text-lg text-[#F5F0E8] mt-0.5">{painting.title}</p>
                </div>
                <div className="flex items-center gap-1 text-[#C9A84C]">
                  <span className="font-inter text-xs uppercase tracking-widest">View</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="p-4 flex items-start justify-between">
            <div>
              <h3 className="font-playfair text-[15px] text-[#F5F0E8] leading-snug">{painting.title}</h3>
              <p className="font-inter text-[10px] uppercase tracking-[0.2em] text-[#8A8070] mt-1">{painting.artist}</p>
            </div>
            <p className="font-inter text-sm text-[#C9A84C] font-medium whitespace-nowrap">${painting.price.toLocaleString()}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedGallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={ref} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-[#C9A84C]">The Collection</span>
            </div>
            <h2 className="font-playfair text-5xl lg:text-6xl text-[#F5F0E8] leading-tight">
              Discover<br />Original Works
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link
              href="/gallery"
              className="group flex items-center gap-2 font-inter text-[11px] uppercase tracking-widest text-[#C9A84C] hover:text-[#d4b55a] transition-colors"
            >
              View all paintings
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paintings.map((p, i) => (
            <PaintingCard key={p.slug} painting={p} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   HOW IT WORKS — Pinned steps
   ──────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Discover', desc: 'Browse hundreds of original paintings, filtered by medium, category, price, and artist origin. Every work is authentic.' },
    { num: '02', title: 'Offer or Buy', desc: 'Purchase instantly or make an offer. Our team negotiates on your behalf and ensures fair terms for both collector and artist.' },
    { num: '03', title: "It's Yours", desc: 'Your painting ships with insurance, a Certificate of Authenticity, and live tracking. We arrange every detail personally.' },
  ];

  return (
    <section className="py-32 px-6 border-t border-[#2E2A22] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-[#C9A84C]">The Process</span>
          </div>
          <h2 className="font-playfair text-5xl lg:text-7xl text-[#F5F0E8] leading-tight max-w-xl">
            Three steps to owning original art.
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-0 divide-y divide-[#2E2A22]">
          {steps.map((step, i) => {
            const ref = useRef(null);
            const inView = useInView(ref, { once: true, margin: '-80px' });
            return (
              <motion.div
                key={step.num}
                ref={ref}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group grid grid-cols-[80px_1fr_auto] lg:grid-cols-[120px_1fr_200px] items-center gap-8 lg:gap-16 py-10 hover:bg-[#1A1710]/40 transition-colors duration-300 cursor-default px-4"
              >
                {/* Number */}
                <span className="font-playfair text-5xl lg:text-6xl font-bold text-[#2E2A22] group-hover:text-[#C9A84C]/30 transition-colors duration-500 leading-none">
                  {step.num}
                </span>
                {/* Title + desc */}
                <div>
                  <h3 className="font-playfair text-2xl lg:text-3xl text-[#F5F0E8] mb-2">{step.title}</h3>
                  <p className="font-inter text-[14px] text-[#8A8070] leading-relaxed max-w-lg">{step.desc}</p>
                </div>
                {/* Arrow */}
                <ArrowUpRight
                  size={24}
                  className="text-[#2E2A22] group-hover:text-[#C9A84C] transition-colors duration-300 opacity-0 group-hover:opacity-100 hidden lg:block"
                />
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 flex gap-4">
          <Link
            href="/how-it-works"
            className="font-inter text-[11px] uppercase tracking-widest text-[#C9A84C] hover:text-[#d4b55a] transition-colors"
          >
            Learn more about the process →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   ARTIST SPOTLIGHT — Horizontal scroll
   ──────────────────────────────────────────────── */
function ArtistSpotlight() {
  const artists = [
    { name: 'Elena Morozova', country: 'Russia', specialty: 'Abstract · Oil', paintings: 9, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    { name: 'James Whitfield', country: 'United States', specialty: 'Landscape · Watercolour', paintings: 12, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    { name: 'Priya Sharma', country: 'India', specialty: 'Portrait · Mixed Media', paintings: 7, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
    { name: 'Omar Hassan', country: 'Egypt', specialty: 'Abstract · Mixed Media', paintings: 14, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
    { name: 'Yuki Tanaka', country: 'Japan', specialty: 'Landscape · Acrylic', paintings: 18, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80' },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-32 border-t border-[#2E2A22] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-[#C9A84C]">The Artists</span>
            </div>
            <h2 className="font-playfair text-5xl lg:text-6xl text-[#F5F0E8] leading-tight">
              The hands<br />behind the work.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link
              href="/artists"
              className="group flex items-center gap-2 font-inter text-[11px] uppercase tracking-widest text-[#C9A84C] hover:text-[#d4b55a] transition-colors"
            >
              Meet all artists
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-5 px-6 overflow-x-auto pb-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {artists.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="group flex-shrink-0 w-64 bg-[#1A1710] border border-[#2E2A22] overflow-hidden cursor-pointer hover:border-[#C9A84C]/30 transition-colors duration-300"
          >
            <div className="relative h-72 overflow-hidden">
              <Image
                src={a.image}
                alt={a.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                sizes="256px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1710]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="p-5">
              <h3 className="font-playfair text-xl text-[#F5F0E8]">{a.name}</h3>
              <p className="font-inter text-[10px] uppercase tracking-widest text-[#8A8070] mt-1.5">{a.country}</p>
              <p className="font-inter text-[11px] text-[#C9A84C] mt-3">{a.specialty}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2E2A22]">
                <span className="font-inter text-[11px] text-[#5A5548]">{a.paintings} paintings</span>
                <ArrowUpRight size={14} className="text-[#2E2A22] group-hover:text-[#C9A84C] transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   TESTIMONIALS
   ──────────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { quote: "I found a painting I'd been searching for my entire life. The process was seamless — like having a private curator.", name: 'Catherine M.', role: 'Collector · London', initials: 'CM' },
    { quote: "As an emerging artist, Artkezai gave me access to collectors I never could have reached on my own. The 85% payout is extraordinary.", name: 'Kenji Watanabe', role: 'Artist · Kyoto', initials: 'KW' },
    { quote: "The certificate of authenticity and the personal shipping coordination made me feel completely secure buying art online for the first time.", name: 'Amélie Rousseau', role: 'Collector · Paris', initials: 'AR' },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-32 px-6 bg-[#1A1710] border-y border-[#2E2A22]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-[#C9A84C]">Voices</span>
            <div className="w-8 h-px bg-[#C9A84C]" />
          </div>
          <h2 className="font-playfair text-5xl text-[#F5F0E8]">What collectors say.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2E2A22]">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="bg-[#1A1710] p-10 group hover:bg-[#1E1B14] transition-colors duration-300"
            >
              <div className="font-playfair text-5xl text-[#C9A84C]/20 leading-none mb-6 group-hover:text-[#C9A84C]/40 transition-colors duration-300">"</div>
              <p className="font-inter text-[15px] text-[#8A8070] leading-8 mb-8 italic">"{q.quote}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-[#2E2A22]">
                <div className="w-10 h-10 bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center">
                  <span className="font-playfair text-xs text-[#C9A84C]">{q.initials}</span>
                </div>
                <div>
                  <p className="font-inter text-sm text-[#F5F0E8]">{q.name}</p>
                  <p className="font-inter text-[10px] uppercase tracking-widest text-[#5A5548] mt-0.5">{q.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   TRUST STRIP
   ──────────────────────────────────────────────── */
function TrustStrip() {
  const items = [
    { icon: Shield, title: 'Certificate of Authenticity', desc: 'Every painting ships with a signed COA from the artist.' },
    { icon: Truck, title: 'Shipping Arranged', desc: 'We coordinate insured, professional art shipping worldwide.' },
    { icon: CreditCard, title: 'Secure Payments', desc: 'Stripe-protected checkout or bank wire transfer.' },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-20 px-6 border-t border-[#2E2A22] bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2E2A22]">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-[#0F0F0F] flex items-start gap-5 p-8 group hover:bg-[#1A1710]/50 transition-colors duration-300"
            >
              <Icon size={20} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-playfair text-lg text-[#F5F0E8] mb-1">{item.title}</h4>
                <p className="font-inter text-sm text-[#8A8070] leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   CTA SECTION
   ──────────────────────────────────────────────── */
function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-40 px-6 overflow-hidden bg-[#0A0A0A] border-t border-[#2E2A22]">
      {/* Background painting */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1600&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-[#C9A84C]">Begin</span>
            <div className="w-8 h-px bg-[#C9A84C]" />
          </div>
          <h2 className="font-playfair text-6xl lg:text-8xl text-[#F5F0E8] leading-[1.05] mb-6">
            Your collection<br />
            <span className="italic text-[#C9A84C]">starts here.</span>
          </h2>
          <p className="font-inter text-[15px] text-[#8A8070] leading-relaxed mb-12 max-w-lg mx-auto">
            Hundreds of original paintings. Independent artists from 38 countries. Yours to discover, offer, and own.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gallery"
              className="group flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0F0F0F] font-inter text-[11px] uppercase tracking-[0.25em] px-10 py-5 hover:bg-[#d4b55a] transition-colors duration-300"
            >
              Enter the Gallery
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center justify-center border border-[#2E2A22] text-[#8A8070] font-inter text-[11px] uppercase tracking-[0.25em] px-10 py-5 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   FOOTER
   ──────────────────────────────────────────────── */
function Footer() {
  const links = {
    Explore: [
      { label: 'Gallery', href: '/gallery' },
      { label: 'Artists', href: '/artists' },
      { label: 'About', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
    ],
    Account: [
      { label: 'Sign In', href: '/auth/login' },
      { label: 'Register', href: '/auth/register' },
      { label: 'Collector Dashboard', href: '/dashboard' },
      { label: 'Artist Portal', href: '/artist' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/policies/privacy' },
      { label: 'Terms of Service', href: '/policies/terms' },
      { label: 'Contact', href: '/contact' },
    ],
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2E2A22] px-6 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-playfair text-xl tracking-[0.2em] text-[#F5F0E8]">ARTKEZAI</span>
              <span className="block font-inter text-[8px] uppercase tracking-[0.4em] text-[#8A8070] mt-0.5">Gallery</span>
            </Link>
            <p className="font-inter text-[13px] text-[#8A8070] leading-7 max-w-xs">
              A curated marketplace for original paintings. We connect independent artists with collectors around the world.
            </p>
            <div className="mt-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C9A84C] rounded-full" />
              <span className="font-inter text-[11px] text-[#8A8070]">Independent artists. Original works only.</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#5A5548] mb-5">{group}</h4>
              <ul className="space-y-3">
                {items.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-inter text-[13px] text-[#8A8070] hover:text-[#C9A84C] transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#2E2A22] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-[11px] text-[#5A5548]">
            © 2024 Artkezai. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#C9A84C]/60 rounded-full" />
            <p className="font-inter text-[11px] text-[#5A5548]">
              Original art. Verified authenticity. Fair for artists.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────
   PAGE ROOT
   ──────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <CustomCursor />
      <GrainOverlay />
      <HeroSection />
      <MarqueeStrip />
      <EditorialSection />
      <FeaturedGallery />
      <HowItWorks />
      <ArtistSpotlight />
      <Testimonials />
      <TrustStrip />
      <CTASection />
      <Footer />
    </>
  );
}
