'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=90';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
    } catch {
      // Always show success — never reveal if email is registered
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-dark)] flex">

      {/* LEFT — Painting panel */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden p-6">
        <div className="ios-card relative w-full h-full overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Gallery painting"
            fill
            className="object-cover"
            priority
            sizes="55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dark)]/20 via-transparent to-[var(--color-dark)]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/85 via-transparent to-transparent" />
        </div>
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-playfair text-[10px] uppercase tracking-[0.14em] text-[var(--color-gold)] mb-2">
            Artkezai Collection
          </p>
          <p className="font-playfair text-2xl text-[var(--color-cream)] leading-snug">
            Amber Reverie
          </p>
          <p className="font-inter text-[10px] uppercase tracking-[0.08em] text-[var(--color-muted)] mt-1">
            Elena Morozova · Oil on Canvas
          </p>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-[var(--color-surface)] relative">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 bg-[var(--color-gold)]/50 origin-top"
        />
      </div>

      {/* RIGHT — Form panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-16 py-16">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm mx-auto lg:mx-0"
        >
          {/* Brand */}
          <Link href="/" className="inline-block mb-14">
            <span className="font-playfair text-[12px] uppercase tracking-[0.14em] text-[var(--color-gold)]">
              Artkezai
            </span>
          </Link>

          <AnimatePresence mode="wait">
            {!submitted ? (
              /* ── Request form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                {/* Back link */}
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors mb-10"
                >
                  <ArrowLeft size={12} />
                  Back to sign in
                </Link>

                <div className="mb-10">
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="font-playfair text-4xl md:text-5xl text-[var(--color-cream)] leading-tight mb-3"
                  >
                    Forgot<br />password?
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="font-inter text-sm text-[var(--color-muted)]"
                  >
                    Enter your email and we'll send you a reset link.
                  </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Email */}
                  <div>
                    <label
                      className="block font-inter text-[10px] uppercase tracking-widest mb-3 transition-colors duration-200"
                      style={{ color: focused ? 'var(--color-gold)' : 'var(--color-subtle)' }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required
                        disabled={isLoading}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 font-inter text-sm border border-[var(--color-border)] rounded-[14px] bg-[color-mix(in_srgb,var(--color-surface)_82%,white_18%)] focus:outline-none focus:border-[var(--color-gold)] disabled:opacity-50 transition-colors"
                      />
                      <Mail
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] pointer-events-none"
                      />
                    </div>
                    {error && (
                      <p className="font-inter text-[10px] text-red-400 mt-2">{error}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group ios-button-primary flex items-center justify-between font-inter uppercase tracking-[0.08em] text-sm px-7 py-4 disabled:opacity-60"
                  >
                    <span>{isLoading ? 'Sending…' : 'Send Reset Link'}</span>
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : (
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
                  <p className="font-inter text-[12px] text-[var(--color-subtle)]">
                    Remembered it?{' '}
                    <Link
                      href="/auth/login"
                      className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors"
                    >
                      Sign in →
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="mb-10">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-8">
                    <CheckCircle size={24} className="text-[var(--color-gold)]" />
                  </div>
                  <h1 className="font-playfair text-4xl text-[var(--color-cream)] leading-tight mb-3">
                    Check your<br />inbox.
                  </h1>
                  <p className="font-inter text-sm text-[var(--color-muted)] leading-relaxed">
                    If <span className="text-[var(--color-cream)]">{email}</span> is registered with Artkezai,
                    you'll receive a password reset link shortly.
                  </p>
                  <p className="font-inter text-xs text-[var(--color-subtle)] mt-3">
                    The link expires in 1 hour. Check your spam folder if you don't see it.
                  </p>
                </div>

                {/* MailHog hint for dev */}
                <div className="mb-8 p-4 border border-[var(--color-border)] rounded-[14px] bg-[var(--color-surface)]">
                  <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)] mb-1">
                    Local dev
                  </p>
                  <p className="font-inter text-xs text-[var(--color-muted)]">
                    Email delivered to{' '}
                    <a
                      href="http://localhost:8025"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-gold)] hover:underline"
                    >
                      MailHog ↗
                    </a>
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => { setSubmitted(false); setEmail(''); }}
                    className="w-full font-inter text-[11px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors py-3"
                  >
                    Try a different email
                  </button>
                  <Link
                    href="/auth/login"
                    className="w-full group ios-button-primary flex items-center justify-between font-inter uppercase tracking-[0.08em] text-sm px-7 py-4"
                  >
                    <span>Back to Sign In</span>
                    <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
