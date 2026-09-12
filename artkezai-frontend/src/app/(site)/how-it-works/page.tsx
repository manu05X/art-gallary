'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Link from 'next/link';
import { Search, ShoppingCart, Package } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const steps = [
  {
    number: '01',
    label: 'Step 01',
    heading: 'Browse & Discover',
    description:
      'Explore hundreds of original paintings from independent artists worldwide. Filter by category, medium, price, and country of origin.',
    icon: Search,
  },
  {
    number: '02',
    label: 'Step 02',
    heading: 'Make an Offer or Buy',
    description:
      'Purchase instantly at the listed price, or open a private negotiation. Our team mediates every deal to ensure fairness for both sides.',
    icon: ShoppingCart,
  },
  {
    number: '03',
    label: 'Step 03',
    heading: 'Receive Your Painting',
    description:
      'Your artwork ships with full insurance, live tracking, and a signed certificate of authenticity. We handle every detail.',
    icon: Package,
  },
];

const collectorItems = [
  {
    name: 'Sign Up Free',
    description: 'Create a collector account in under a minute.',
  },
  {
    name: 'Browse the Gallery',
    description: 'Filter by category, medium, price, and artist origin.',
  },
  {
    name: 'Make an Offer',
    description: 'Negotiate directly with the artist within our platform.',
  },
  {
    name: 'Complete Secure Payment',
    description: 'Pay via Stripe. Funds held until shipment confirmed.',
  },
  {
    name: 'Track & Receive',
    description: 'Live tracking plus certificate of authenticity on arrival.',
  },
];

const artistItems = [
  {
    name: 'Create Your Profile',
    description: 'Build your artist page with bio, portrait, and portfolio.',
  },
  {
    name: 'Submit Paintings',
    description: 'Upload artwork with high-res images and full descriptions.',
  },
  {
    name: 'Pass Moderation',
    description: 'Our team reviews for quality and authenticity.',
  },
  {
    name: 'Manage Offers',
    description: 'Accept, counter, or decline buyer offers within 72 hours.',
  },
  {
    name: 'Get Paid 85%',
    description: 'Receive 85% of the sale price directly to your account.',
  },
];

const stats = [
  { value: '85%', label: 'Artist Payout' },
  { value: '72hr', label: 'Offer Response Window' },
  { value: '100%', label: 'Authenticity Verified' },
];

export default function HowItWorksPage() {
  return (
    <div
      style={{ backgroundColor: 'var(--color-dark)', color: 'var(--color-cream)' }}
      className="min-h-screen"
    >
      {/* Section 1 — Hero */}
      <div
        style={{
          backgroundColor: 'var(--color-dark)',
          borderBottom: '1px solid var(--color-border)',
        }}
        className="pt-32 pb-20 px-6"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          {/* Left */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}
              className="mb-6"
            >
              The Process
            </motion.p>
            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                color: 'var(--color-cream)',
                lineHeight: 1.1,
              }}
            >
              How it Works.
            </motion.h1>
            <motion.div
              variants={itemVariants}
              style={{
                height: '1px',
                backgroundColor: 'var(--color-gold)',
                width: '64px',
                marginTop: '24px',
              }}
            />
          </motion.div>

          {/* Right */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                color: 'var(--color-muted)',
                lineHeight: 1.75,
              }}
            >
              We have simplified the art of buying and collecting original paintings. Every step is designed around trust,
              clarity, and the joy of owning something truly unique.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Section 2 — Three Steps */}
      {steps.map((step, index) => (
        <AnimatedSection key={step.number}>
          <div
            style={{ borderBottom: '1px solid var(--color-border)' }}
            className="py-24 px-6"
          >
            <div
              className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                index % 2 === 1 ? 'lg:flex lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content Side */}
              <div className="relative">
                {/* Watermark number */}
                <span
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '160px',
                    color: 'color-mix(in srgb, var(--color-gold) 45%, transparent)',
                    fontWeight: 700,
                    position: 'absolute',
                    top: '-60px',
                    left: '-20px',
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>

                <div className="relative z-10">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--color-gold)',
                    }}
                    className="mb-4"
                  >
                    {step.label}
                  </p>
                  <h2
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                      color: 'var(--color-cream)',
                      lineHeight: 1.15,
                    }}
                    className="mb-6"
                  >
                    {step.heading}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      color: 'var(--color-muted)',
                      lineHeight: 1.75,
                      maxWidth: '420px',
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Visual Side */}
              <div
                style={{
                  backgroundColor: 'var(--ios-glass)',
                  border: '1px solid var(--ios-glass-border)',
                  height: '320px',
                  aspectRatio: '1 / 1',
                  maxWidth: '320px',
                  width: '100%',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--ios-radius-xl)',
                  backdropFilter: 'blur(18px) saturate(135%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(135%)',
                  boxShadow: 'var(--ios-shadow-sm)',
                }}
              >
                <step.icon
                  size={48}
                  style={{ color: 'var(--color-gold)', opacity: 0.55 }}
                  strokeWidth={1}
                />
              </div>
            </div>
          </div>
        </AnimatedSection>
      ))}

      {/* Section 3 — For Collectors */}
      <AnimatedSection>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
          className="py-24 px-6"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Left heading col (1/3) */}
            <div>
              <h2
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  color: 'var(--color-cream)',
                  lineHeight: 1.15,
                }}
                className="mb-4"
              >
                For Collectors
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: 'var(--color-muted)',
                }}
              >
                Your guide to buying original art
              </p>
            </div>

            {/* Right items col (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {collectorItems.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--color-gold)',
                      borderRadius: '9999px',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--color-cream)',
                      }}
                      className="mb-1"
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: 'var(--color-muted)',
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Section 4 — For Artists */}
      <AnimatedSection>
        <div
          style={{
            backgroundColor: 'var(--color-dark)',
            borderBottom: '1px solid var(--color-border)',
          }}
          className="py-24 px-6"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Left items col (2/3) — flipped */}
            <div className="lg:col-span-2 space-y-8 lg:order-1">
              {artistItems.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--color-gold)',
                      borderRadius: '9999px',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--color-cream)',
                      }}
                      className="mb-1"
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: 'var(--color-muted)',
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right heading col (1/3) */}
            <div className="lg:order-2">
              <h2
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  color: 'var(--color-cream)',
                  lineHeight: 1.15,
                }}
                className="mb-4"
              >
                For Artists
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: 'var(--color-muted)',
                }}
              >
                Your guide to selling original art
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Section 5 — Stats Row */}
      <AnimatedSection>
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-dark)',
          }}
          className="py-20 px-6"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  borderLeft: index > 0 ? '1px solid var(--color-border)' : 'none',
                }}
                className="text-center py-8 px-8"
              >
                <p
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(3rem, 7vw, 4.5rem)',
                    color: 'var(--color-gold)',
                    lineHeight: 1,
                    fontWeight: 700,
                  }}
                  className="mb-3"
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Section 6 — CTA */}
      <AnimatedSection>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
          }}
          className="py-24 px-6 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}
              className="mb-6"
            >
              Ready to Start
            </p>
            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--color-cream)',
                lineHeight: 1.15,
              }}
              className="mb-10"
            >
              Begin your collection.
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href="/gallery"
                className="ios-button-primary inline-flex items-center justify-center font-inter text-[13px] uppercase tracking-[0.08em] px-8 py-4"
              >
                Enter the Gallery →
              </Link>
              <Link
                href="/auth/register"
                className="ios-button-secondary inline-flex items-center justify-center font-inter text-[13px] uppercase tracking-[0.08em] px-8 py-4"
              >
                Create Account
              </Link>
            </div>

            <Link
              href="/contact"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: 'var(--color-muted)',
                textDecoration: 'none',
              }}
            >
              Have questions? Contact us
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
