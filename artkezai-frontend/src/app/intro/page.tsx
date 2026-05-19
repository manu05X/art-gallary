'use client';

import { useState, useEffect, useRef } from 'react';
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

const BAR_HEIGHTS = [28, 48, 68, 52, 20, 36, 60, 44, 24, 56, 72, 40, 28, 64, 36];

const CURSIVE_TEXT = 'Welcome to the';

/* ── Typewriter hook ── */
function useTypewriter(text: string, speed = 70, startDelay = 400) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function IntroPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'loader' | 'intro' | 'leaving'>('loader');
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase('intro'), 2800);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setPhase('leaving');
    setTimeout(() => router.push('/'), 900);
  };

  /* typewriter starts after intro fades in */
  const { displayed: cursiveText, done: cursiveDone } = useTypewriter(
    CURSIVE_TEXT,
    75,
    phase === 'intro' ? 500 : 999999
  );

  return (
    <>
      {/* Google Font — Dancing Script for cursive */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');

        /* Apple liquid glass button */
        .liquid-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.7rem 2.6rem;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 -1px 0 rgba(0,0,0,0.3) inset,
            0 8px 32px rgba(0,0,0,0.4),
            0 2px 8px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .liquid-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
          border-radius: 9999px 9999px 0 0;
          pointer-events: none;
        }
        .liquid-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.2) inset,
            0 -1px 0 rgba(0,0,0,0.3) inset,
            0 12px 40px rgba(0,0,0,0.5),
            0 4px 12px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .liquid-btn:active {
          transform: translateY(0px) scale(0.98);
        }

        /* Apple liquid glass — light/white state */
        .liquid-btn-light {
          border-color: rgba(0,0,0,0.14);
          background: rgba(255,255,255,0.55);
          color: #1a1a1a;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 -1px 0 rgba(0,0,0,0.08) inset,
            0 8px 32px rgba(0,0,0,0.12),
            0 2px 8px rgba(0,0,0,0.08);
        }
        .liquid-btn-light::before {
          background: linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 100%);
        }
        .liquid-btn-light:hover {
          background: rgba(255,255,255,0.75);
          border-color: rgba(0,0,0,0.2);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.95) inset,
            0 -1px 0 rgba(0,0,0,0.08) inset,
            0 12px 40px rgba(0,0,0,0.15),
            0 4px 12px rgba(0,0,0,0.1);
        }

        .cursor-blink {
          display: inline-block;
          width: 2px;
          height: 1.1em;
          background: rgba(255,255,255,0.7);
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 0.85s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* Title letter emerge */
        .title-letter {
          display: inline-block;
        }
      `}</style>

      <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#080808' }}>

        {/* Film grain */}
        <div
          className="fixed inset-0 pointer-events-none z-[30] opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* ════ LOADER ════ */}
        <AnimatePresence>
          {phase === 'loader' && (
            <motion.div
              key="loader"
              className="absolute inset-0 flex flex-col items-center justify-center z-20"
              style={{ background: '#000' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            >
              <motion.div
                className="flex items-end gap-[3px] mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {BAR_HEIGHTS.map((h, i) => (
                  <motion.div
                    key={i}
                    style={{ width: 3, height: h, background: '#fff', borderRadius: 1, originY: 1 }}
                    animate={{ scaleY: [1, 0.25, 1.15, 0.55, 1], opacity: [0.9, 0.35, 1, 0.5, 0.9] }}
                    transition={{
                      duration: 1.3,
                      delay: i * 0.065,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 'clamp(0.75rem, 1.8vw, 1rem)',
                  fontWeight: 400,
                  color: '#fff',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                }}
              >
                The Artkezai Gallery
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════ INTRO ════ */}
        <AnimatePresence>
          {(phase === 'intro' || phase === 'leaving') && (
            <motion.div
              key="intro"
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'leaving' ? 0 : 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            >
              {/* Background */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 90% 80% at 50% 50%, #1e1e1e 0%, #0f0f0f 45%, #080808 100%)',
                }}
              />

              {/* Edge vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 10%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.82) 100%)',
                  zIndex: 2,
                }}
              />

              {/* Floating circles */}
              {CIRCLES.map((c, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full overflow-hidden"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: c.size,
                    height: c.size,
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
                    zIndex: 1,
                  }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 0.6, scale: 1, y: [0, -(c.dur * 2.5), 0] }}
                  transition={{
                    opacity: { duration: 1.0, delay: c.delay },
                    scale:   { duration: 1.0, delay: c.delay },
                    y: { duration: c.dur, delay: c.delay + 1.0, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
                  }}
                >
                  <Image src={c.src} alt="" fill className="object-cover" sizes={`${c.size}px`} />
                  <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,0.42) 100%)' }} />
                </motion.div>
              ))}

              {/* ── Centre content ── */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ zIndex: 10 }}>

                {/* Cursive typewriter */}
                <div
                  style={{
                    fontFamily: '"Dancing Script", cursive',
                    fontSize: 'clamp(1.6rem, 3.2vw, 2.5rem)',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    color: 'rgba(255,255,255,0.72)',
                    letterSpacing: '0.01em',
                    marginBottom: '0.2rem',
                    lineHeight: 1.2,
                    minHeight: '1.4em',
                  }}
                >
                  {cursiveText}
                  {!cursiveDone && <span className="cursor-blink" />}
                </div>

                {/* Main title — letters emerge one by one */}
                {'ARTKEZAI GALLERY'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    className="title-letter"
                    initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                    animate={cursiveDone ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.045,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontSize: 'clamp(2.2rem, 5.8vw, 5rem)',
                      fontWeight: 700,
                      color: '#ffffff',
                      letterSpacing: char === ' ' ? '0.35em' : '0.08em',
                      textTransform: 'uppercase',
                      lineHeight: 1.05,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}

                {/* Subtitle — emerges after title */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={cursiveDone ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1.0, delay: 'ARTKEZAI GALLERY'.length * 0.045 + 0.3, ease: 'easeOut' }}
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 'clamp(0.7rem, 1.3vw, 0.85rem)',
                    color: 'rgba(255,255,255,0.45)',
                    maxWidth: 450,
                    lineHeight: 1.8,
                    marginTop: '1.1rem',
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
                  animate={cursiveDone ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.9, delay: 'ARTKEZAI GALLERY'.length * 0.045 + 0.6 }}
                  className="flex flex-col items-center gap-4"
                >
                  {/* Apple liquid glass ENTER button */}
                  <button className="liquid-btn" onClick={handleEnter}>
                    Enter
                  </button>

                  {/* Skip link */}
                  <button
                    onClick={handleEnter}
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.58rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.28)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                      textDecorationColor: 'rgba(255,255,255,0.15)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                  >
                    Browse Gallery Directly
                  </button>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 2.5 }}
                className="absolute bottom-7 left-0 right-0 flex items-center justify-center gap-6"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.56rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.16)',
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
    </>
  );
}
