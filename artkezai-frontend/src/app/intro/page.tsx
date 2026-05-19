'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Floating painting images ── */
const CIRCLES = [
  { src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80', size: 140, x: 8,  y: 12,  dur: 5.2, delay: 0    },
  { src: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=500&q=80', size: 110, x: 22, y: 5,   dur: 4.8, delay: 0.4  },
  { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=500&q=80', size: 160, x: 55, y: 3,   dur: 5.6, delay: 0.8  },
  { src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&q=80', size: 125, x: 75, y: 10,  dur: 4.4, delay: 0.2  },
  { src: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80', size: 150, x: 88, y: 38,  dur: 5.0, delay: 0.6  },
  { src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&q=80', size: 135, x: 68, y: 65,  dur: 4.7, delay: 1.0  },
  { src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80', size: 120, x: 38, y: 72,  dur: 5.3, delay: 0.3  },
  { src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&q=80', size: 145, x: 18, y: 68,  dur: 4.9, delay: 0.7  },
  { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80', size: 115, x: 4,  y: 40,  dur: 5.1, delay: 0.5  },
  { src: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=500&q=80', size: 130, x: 48, y: 78,  dur: 4.6, delay: 0.9  },
];

export default function IntroPage() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => router.push('/'), 900);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]" style={{ cursor: 'default' }}>

      {/* ── Grain texture ── */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* ── Radial vignette ── */}
      <div
        className="fixed inset-0 pointer-events-none z-[5]"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* ── Floating circle paintings ── */}
      {mounted && CIRCLES.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full overflow-hidden"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 2,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.7, 0.7],
            scale: [0.6, 1, 1],
            y: [0, -c.dur * 3, 0],
          }}
          transition={{
            opacity: { duration: 1.2, delay: c.delay },
            scale: { duration: 1.2, delay: c.delay },
            y: {
              duration: c.dur,
              delay: c.delay + 1.2,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
          }}
        >
          <Image
            src={c.src}
            alt=""
            fill
            className="object-cover"
            sizes={`${c.size}px`}
          />
          {/* subtle inner vignette on each circle */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%)',
            }}
          />
        </motion.div>
      ))}

      {/* ── Center content ── */}
      <AnimatePresence>
        {!entered && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Italic script */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.8, ease: 'easeOut' }}
              className="mb-3"
              style={{
                fontFamily: '"Dancing Script", "Palatino Linotype", Georgia, serif',
                fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: '0.02em',
              }}
            >
              Welcome to the
            </motion.p>

            {/* Main title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(2.2rem, 6vw, 5rem)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1.1,
                marginBottom: '1.25rem',
              }}
            >
              Artkezai Gallery
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.4, ease: 'easeOut' }}
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
                color: 'rgba(255,255,255,0.5)',
                maxWidth: 480,
                lineHeight: 1.7,
                marginBottom: '2.5rem',
                letterSpacing: '0.01em',
              }}
            >
              A curated collection of original paintings from independent artists worldwide —
              discover, collect, and connect.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.7, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              {/* ENTER button */}
              <button
                onClick={handleEnter}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.5)',
                  padding: '0.7rem 2.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: '2px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.9)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.5)';
                }}
              >
                Enter
              </button>

              {/* Skip link */}
              <button
                onClick={handleEnter}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'}
              >
                Browse Gallery Directly
              </button>
            </motion.div>

            {/* Footer credits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 2.2 }}
              className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              <span>Original Paintings</span>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
              <span>Independent Artists</span>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
              <span>Worldwide Collectors</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
