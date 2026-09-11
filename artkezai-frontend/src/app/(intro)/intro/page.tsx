'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Floating circle paintings ── */
const CIRCLES = [
  { src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80', size: 140, x: 8,  y: 10,  dur: 5.2, delay: 0   },
  { src: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=500&q=80', size: 110, x: 22, y: 4,   dur: 4.8, delay: 0.3 },
  { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=500&q=80',    size: 160, x: 55, y: 2,   dur: 5.6, delay: 0.6 },
  { src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&q=80', size: 125, x: 76, y: 8,   dur: 4.4, delay: 0.2 },
  { src: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80', size: 150, x: 88, y: 36,  dur: 5.0, delay: 0.5 },
  { src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&q=80',    size: 135, x: 70, y: 64,  dur: 4.7, delay: 0.8 },
  { src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80', size: 120, x: 38, y: 72,  dur: 5.3, delay: 0.4 },
  { src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&q=80', size: 145, x: 16, y: 66,  dur: 4.9, delay: 0.7 },
  { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80', size: 115, x: 3,  y: 38,  dur: 5.1, delay: 0.5 },
  { src: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=500&q=80', size: 130, x: 46, y: 76,  dur: 4.6, delay: 0.9 },
];

/* ── Waveform bar heights (matching the screenshot pattern) ── */
const BAR_HEIGHTS = [28, 48, 68, 52, 20, 36, 60, 44, 24, 56, 72, 40, 28, 64, 36];

export default function IntroPage() {
  const router = useRouter();
  // phase: 'loader' → 'intro' → 'leaving'
  const [phase, setPhase] = useState<'loader' | 'intro' | 'leaving'>('loader');

  useEffect(() => {
    // After 2.8s loader → fade into intro
    const t = setTimeout(() => setPhase('intro'), 2800);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setPhase('leaving');
    setTimeout(() => router.push('/'), 900);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#080808' }}>

      {/* ── Film grain ── */}
      <div
        className="fixed inset-0 pointer-events-none z-[30] opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* ════════════════════════════════════
          PHASE 1 — LOADER
          Pure black, waveform bars + text
      ════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'loader' && (
          <motion.div
            key="loader"
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
            style={{ background: '#000000' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            {/* Animated waveform bars */}
            <motion.div
              className="flex items-end gap-[3px] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {BAR_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    background: '#ffffff',
                    borderRadius: 1,
                    originY: 1,
                  }}
                  animate={{
                    scaleY: [1, 0.3, 1.2, 0.6, 1],
                    opacity: [0.9, 0.4, 1, 0.5, 0.9],
                  }}
                  transition={{
                    duration: 1.4,
                    delay: i * 0.07,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Loader text */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                fontWeight: 400,
                color: '#ffffff',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              The Artkezai Gallery
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          PHASE 2 — INTRO PAGE
          Floating circles + welcome text
      ════════════════════════════════════ */}
      <AnimatePresence>
        {(phase === 'intro' || phase === 'leaving') && (
          <motion.div
            key="intro"
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'leaving' ? 0 : 1 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          >
            {/* Dark gradient background (not pure black — has subtle centre lift) */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 80% 80% at 50% 50%, #1a1a1a 0%, #0d0d0d 50%, #080808 100%)',
              }}
            />

            {/* Radial vignette — darkens edges */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 65% 65% at 50% 50%, transparent 15%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.85) 100%)',
                zIndex: 2,
              }}
            />

            {/* Floating circle paintings */}
            {CIRCLES.map((c, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full overflow-hidden"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: c.size,
                  height: c.size,
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  zIndex: 1,
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: 0.65,
                  scale: 1,
                  y: [0, -(c.dur * 2.5), 0],
                }}
                transition={{
                  opacity: { duration: 1.0, delay: c.delay },
                  scale:   { duration: 1.0, delay: c.delay },
                  y: {
                    duration: c.dur,
                    delay: c.delay + 1.0,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  },
                }}
              >
                <Image src={c.src} alt="" fill className="object-cover" sizes={`${c.size}px`} />
                {/* inner vignette per circle */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,0.45) 100%)' }}
                />
              </motion.div>
            ))}

            {/* ── Centre content ── */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
              style={{ zIndex: 10 }}
            >
              {/* Italic script "Welcome to the" */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.3, ease: 'easeOut' }}
                style={{
                  fontFamily: '"Dancing Script", "Palatino Linotype", Georgia, serif',
                  fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.72)',
                  letterSpacing: '0.01em',
                  marginBottom: '0.3rem',
                  lineHeight: 1.2,
                }}
              >
                Welcome to the
              </motion.p>

              {/* Main bold uppercase title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 'clamp(2rem, 5.5vw, 4.8rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  lineHeight: 1.05,
                  marginBottom: '1.2rem',
                }}
              >
                Artkezai Gallery
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.8, ease: 'easeOut' }}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 'clamp(0.72rem, 1.4vw, 0.88rem)',
                  color: 'rgba(255,255,255,0.48)',
                  maxWidth: 460,
                  lineHeight: 1.75,
                  marginBottom: '2.4rem',
                  letterSpacing: '0.01em',
                }}
              >
                Capturing original works from independent artists worldwide —<br />
                discover, collect, and connect with art that moves you.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 1.05, ease: 'easeOut' }}
                className="flex flex-col items-center gap-4"
              >
                {/* ENTER */}
                <button
                  onClick={handleEnter}
                  className="font-inter text-[11px] uppercase tracking-[0.06em] px-8 py-2.5 ios-button-primary"
                >
                  Enter
                </button>

                {/* Enter without music style link */}
                <button
                  onClick={handleEnter}
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    textDecorationColor: 'rgba(255,255,255,0.2)',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'}
                >
                  Browse Gallery Directly
                </button>
              </motion.div>
            </div>

            {/* Footer credits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 1.4 }}
              className="absolute bottom-7 left-0 right-0 flex items-center justify-center gap-6"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.58rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.18)',
                zIndex: 10,
              }}
            >
              <span>Original Paintings</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Independent Artists</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Worldwide Collectors</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
