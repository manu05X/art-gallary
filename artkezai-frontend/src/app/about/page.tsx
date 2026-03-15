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
  return (
    <main style={{ backgroundColor: '#0F0F0F', color: '#F5F0E8' }}>
      {/* Section 1 — Split Hero */}
      <section
        className="flex flex-row"
        style={{ minHeight: '100vh', backgroundColor: '#0F0F0F' }}
      >
        {/* Left — Image */}
        <div
          className="hidden lg:flex"
          style={{ width: '55%', position: 'relative', overflow: 'hidden' }}
        >
          <Image
            src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=90"
            alt="Gallery"
            fill
            className="object-cover"
            priority
            sizes="55vw"
          />
          {/* Right-to-dark gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(15,15,15,0.80))',
            }}
          />
          {/* Bottom-to-dark gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(15,15,15,0.70), transparent, transparent)',
            }}
          />
          {/* Gold frame */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '24px',
              border: '1px solid rgba(201,168,76,0.15)',
            }}
          />
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
            backgroundColor: '#0F0F0F',
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
                letterSpacing: '0.35em',
                color: '#C9A84C',
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
                color: '#F5F0E8',
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
                backgroundColor: '#C9A84C',
                margin: '2rem 0',
              }}
            />

            {/* Body */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: '#8A8070',
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
                  backgroundColor: 'rgba(201,168,76,0.30)',
                }}
              />
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '2.25rem',
                  color: '#F5F0E8',
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
                  color: '#8A8070',
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
                  color: '#8A8070',
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
            backgroundColor: '#1A1710',
            borderTop: '1px solid #2E2A22',
            borderBottom: '1px solid #2E2A22',
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
                color: '#C9A84C',
                marginBottom: '1rem',
              }}
            >
              What We Stand For
            </p>
            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '2.25rem',
                color: '#F5F0E8',
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
              backgroundColor: '#2E2A22',
            }}
          >
            {values.map((value) => (
              <div
                key={value.number}
                style={{
                  backgroundColor: '#1A1710',
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
                    color: '#C9A84C',
                    textTransform: 'uppercase',
                  }}
                >
                  {value.number}
                </span>
                <h3
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '1.5rem',
                    color: '#F5F0E8',
                    margin: 0,
                  }}
                >
                  {value.name}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#8A8070',
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
            backgroundColor: '#0F0F0F',
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
                color: '#C9A84C',
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
                color: '#F5F0E8',
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
                color: '#8A8070',
                margin: 0,
              }}
            >
              — The Founders, 2024
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Section 5 — Numbers */}
      <AnimatedSection>
        <section
          style={{
            borderTop: '1px solid #2E2A22',
            borderBottom: '1px solid #2E2A22',
            padding: '5rem 1.5rem',
            backgroundColor: '#1A1710',
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
                  borderLeft: index !== 0 ? '1px solid #2E2A22' : 'none',
                  padding: '1rem 2rem',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                    color: '#C9A84C',
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
                    color: '#8A8070',
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
            backgroundColor: '#0F0F0F',
            borderTop: '1px solid #2E2A22',
            padding: '6rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.35em',
              color: '#C9A84C',
              marginBottom: '1.25rem',
            }}
          >
            Begin Your Journey
          </p>

          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2.25rem, 4vw, 3rem)',
              color: '#F5F0E8',
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
              style={{
                display: 'inline-block',
                backgroundColor: '#C9A84C',
                color: '#0F0F0F',
                fontFamily: '"Playfair Display", serif',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '0.875rem',
                padding: '1rem 2rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Browse Gallery →
            </Link>

            {/* Secondary button */}
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                border: '1px solid #2E2A22',
                color: '#8A8070',
                fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '0.75rem',
                padding: '1rem 2rem',
                textDecoration: 'none',
                transition: 'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C9A84C';
                e.currentTarget.style.color = '#C9A84C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2E2A22';
                e.currentTarget.style.color = '#8A8070';
              }}
            >
              Questions? Contact us
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </main>
  );
}
