'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Image from 'next/image';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const values = [
  {
    number: '01',
    name: 'Authenticity',
    description:
      'Every painting ships with a certificate signed directly by the artist. No reproductions, no prints — only verifiable originals.',
  },
  {
    number: '02',
    name: 'Transparency',
    description:
      'Prices are clear, fees are stated upfront, and every artwork comes with complete provenance documentation.',
  },
  {
    number: '03',
    name: 'Community',
    description:
      'Eighty-five percent of every sale goes directly to the artist. We grow only when the artists we represent grow.',
  },
  {
    number: '04',
    name: 'Curation',
    description:
      'Our moderation team reviews every submission personally. We would rather have fewer paintings than compromise on quality.',
  },
];

const stats = [
  { number: '500+', label: 'Artists Represented' },
  { number: '2,400+', label: 'Original Works' },
  { number: '38', label: 'Countries' },
  { number: '85%', label: 'Artist Payout' },
];

export default function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <main style={{ backgroundColor: 'var(--color-dark)', color: 'var(--color-cream)' }}>
      {/* Section 1 — Split Hero */}
      <section
        className="flex flex-row"
        style={{ minHeight: '100vh', backgroundColor: 'var(--color-dark)' }}
      >
        {/* Left — Image */}
        <div
          className="hidden lg:flex"
          style={{ width: '55%', position: 'relative', overflow: 'hidden', padding: '1.75rem' }}
        >
          <div
            className="ios-card"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=90"
              alt="Gallery"
              fill
              className="object-cover"
              priority
              sizes="55vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, transparent 8%, color-mix(in srgb, var(--color-dark) 72%, transparent) 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, color-mix(in srgb, var(--color-dark) 62%, transparent), transparent 45%, transparent)',
              }}
            />
          </div>
        </div>

        {/* Right — Content */}
        <div
          className="flex flex-col justify-center"
          style={{
            flex: 1,
            paddingLeft: 'clamp(2rem, 4vw, 4rem)',
            paddingRight: 'clamp(2rem, 4vw, 4rem)',
            paddingTop: '6rem',
            paddingBottom: '6rem',
            backgroundColor: 'var(--color-dark)',
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '520px' }}
          >
            {/* Gold label */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--color-gold)',
                marginBottom: '1.5rem',
              }}
            >
              About Artkezai
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 'clamp(2.75rem, 5vw, 3.75rem)',
                lineHeight: 1.1,
                color: 'var(--color-cream)',
                margin: 0,
              }}
            >
              Art belongs
              <br />
              to everyone.
            </motion.h1>

            {/* Thin gold line */}
            <motion.div
              variants={itemVariants}
              style={{
                width: '48px',
                height: '1px',
                backgroundColor: 'var(--color-gold)',
                margin: '2rem 0',
              }}
            />

            {/* Body */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: 'var(--color-muted)',
                lineHeight: 2,
                margin: 0,
              }}
            >
              We exist to dissolve the invisible walls between extraordinary art
              and the people who deserve to live with it.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section 2 — Mission */}
      <AnimatedSection>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '6rem 1.5rem',
          }}
        >
          <div
            className="lg:grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}
          >
            {/* Left */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: 'var(--color-gold)',
                  opacity: 0.3,
                }}
              />
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '2.25rem',
                  color: 'var(--color-cream)',
                  paddingLeft: '1.5rem',
                  margin: 0,
                }}
              >
                Our Mission
              </h2>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  color: 'var(--color-muted)',
                  lineHeight: 2,
                  margin: 0,
                }}
              >
                Artkezai was built on a single belief: the art market should not
                have gatekeepers. We created a direct bridge between independent
                artists and collectors around the world — a private gallery
                without walls, open twenty-four hours a day.
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  color: 'var(--color-muted)',
                  lineHeight: 2,
                  margin: 0,
                }}
              >
                Every painting in our collection is an original. Every artist
                earns a fair share. Every collector receives full provenance and
                a certificate of authenticity. That is our promise, and it does
                not change.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Section 3 — Values */}
      <AnimatedSection>
        <section
          style={{
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            padding: '6rem 1.5rem',
          }}
        >
          {/* Centered heading */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'var(--color-gold)',
                marginBottom: '1rem',
              }}
            >
              What We Stand For
            </p>
            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '2.25rem',
                color: 'var(--color-cream)',
                margin: 0,
              }}
            >
              Our values.
            </h2>
          </div>

          {/* 2x2 grid — gap-px with bg as grid lines */}
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1px',
              backgroundColor: 'var(--color-border)',
            }}
          >
            {values.map((value) => (
              <div
                key={value.number}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: 'var(--color-gold)',
                    textTransform: 'uppercase',
                  }}
                >
                  {value.number}
                </span>
                <h3
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '1.5rem',
                    color: 'var(--color-cream)',
                    margin: 0,
                  }}
                >
                  {value.name}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: 'var(--color-subtle)',
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Section 4 — Story / Quote */}
      <AnimatedSection>
        <section
          style={{
            backgroundColor: 'var(--color-bg)',
            padding: '6rem 1.5rem',
          }}
        >
          <div style={{ maxWidth: '896px', margin: '0 auto' }}>
            {/* Decorative opening quote */}
            <div
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '120px',
                lineHeight: 1,
                color: 'var(--color-gold)',
                fontWeight: 700,
                marginBottom: '-1rem',
              }}
            >
              &ldquo;
            </div>

            {/* Quote body */}
            <blockquote
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)',
                color: 'var(--color-cream)',
                lineHeight: 1.65,
                margin: '0 0 2rem 0',
              }}
            >
              We started Artkezai because we were collectors who were tired of
              the barriers — the galleries that ignored emerging artists, the
              auction houses that priced out new buyers, the opacity of a market
              that should have been open to everyone.
            </blockquote>

            {/* Attribution */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-muted)',
                margin: 0,
              }}
            >
              — The Founders, {currentYear}
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 5 — Numbers */}
      <AnimatedSection>
        <section
          style={{
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            padding: '5rem 1.5rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  borderLeft: index !== 0 ? '1px solid var(--color-border)' : 'none',
                  padding: '1rem 2rem',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                    color: 'var(--color-gold)',
                    lineHeight: 1.1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {stat.number}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--color-muted)',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Section 6 — CTA */}
      <AnimatedSection>
        <section
          style={{
            backgroundColor: 'var(--color-dark)',
            borderTop: '1px solid var(--color-border)',
            padding: '6rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--color-gold)',
              marginBottom: '1.25rem',
            }}
          >
            Begin Your Journey
          </p>

          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2.25rem, 4vw, 3rem)',
              color: 'var(--color-cream)',
              margin: '0 0 2.5rem 0',
              lineHeight: 1.15,
            }}
          >
            Start your collection today.
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Primary button */}
            <Link
              href="/gallery"
              className="ios-button-primary inline-flex items-center justify-center font-inter text-[13px] uppercase tracking-[0.08em] px-8 py-4"
            >
              Browse Gallery →
            </Link>

            {/* Secondary button */}
            <Link
              href="/contact"
              className="ios-button-secondary inline-flex items-center justify-center font-inter text-[12px] uppercase tracking-[0.08em] px-8 py-4"
            >
              Questions? Contact us
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </main>
  );
}
