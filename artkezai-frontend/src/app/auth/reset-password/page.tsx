'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1200&q=90';

/* ── Needs Suspense because useSearchParams() requires it in Next.js 14 ── */
function ResetPasswordForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const token       = params.get('token') ?? '';

  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [focused, setFocused]               = useState<string | null>(null);
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({});
  const [isLoading, setIsLoading]           = useState(false);
  const [status, setStatus]                 = useState<'idle' | 'success' | 'invalid_token'>('idle');

  // Catch missing token immediately
  useEffect(() => {
    if (!token) setStatus('invalid_token');
  }, [token]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (newPassword.length < 8)
      errs.newPassword = 'Password must be at least 8 characters.';
    if (newPassword !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setStatus('success');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setStatus('invalid_token');
      } else {
        setFieldErrors({ form: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">

      {/* ── Invalid / missing token ── */}
      {status === 'invalid_token' && (
        <motion.div
          key="invalid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-8">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <h1 className="font-playfair text-4xl text-[var(--color-cream)] leading-tight mb-3">
            Link expired<br />or invalid.
          </h1>
          <p className="font-inter text-sm text-[var(--color-muted)] mb-8 leading-relaxed">
            This password reset link is no longer valid. Links expire after 1 hour.
            Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="w-full group ios-button-primary flex items-center justify-between font-inter uppercase tracking-[0.08em] text-sm px-7 py-4"
          >
            <span>Request New Link</span>
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="font-inter text-[11px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Success ── */}
      {status === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-8">
            <CheckCircle size={24} className="text-[var(--color-gold)]" />
          </div>
          <h1 className="font-playfair text-4xl text-[var(--color-cream)] leading-tight mb-3">
            Password<br />updated.
          </h1>
          <p className="font-inter text-sm text-[var(--color-muted)] mb-8 leading-relaxed">
            Your password has been reset successfully. Redirecting you to sign in…
          </p>
          {/* Progress bar */}
          <div className="h-px w-full bg-[var(--color-border)] overflow-hidden rounded-full mb-8">
            <motion.div
              className="h-full bg-[var(--color-gold)]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </div>
          <Link
            href="/auth/login"
            className="w-full group ios-button-primary flex items-center justify-between font-inter uppercase tracking-[0.08em] text-sm px-7 py-4"
          >
            <span>Sign In Now</span>
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      )}

      {/* ── Reset form ── */}
      {status === 'idle' && (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-playfair text-4xl md:text-5xl text-[var(--color-cream)] leading-tight mb-3"
            >
              Set new<br />password.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="font-inter text-sm text-[var(--color-muted)]"
            >
              Choose a strong password — at least 8 characters.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Global form error */}
            {fieldErrors.form && (
              <div className="flex items-center gap-2 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="font-inter text-xs text-red-400">{fieldErrors.form}</p>
              </div>
            )}

            {/* New password */}
            <div>
              <label
                className="block font-inter text-[10px] uppercase tracking-widest mb-3 transition-colors duration-200"
                style={{ color: focused === 'new' ? 'var(--color-gold)' : 'var(--color-subtle)' }}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setFieldErrors((p) => ({ ...p, newPassword: '' })); }}
                  onFocus={() => setFocused('new')}
                  onBlur={() => setFocused(null)}
                  required
                  disabled={isLoading}
                  placeholder="Min. 8 characters"
                  className="w-full pl-4 pr-10 py-3 font-inter text-sm border border-[var(--color-border)] rounded-[14px] bg-[color-mix(in_srgb,var(--color-surface)_82%,white_18%)] focus:outline-none focus:border-[var(--color-gold)] disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPassword.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => {
                    const strength = Math.min(
                      Math.floor(newPassword.length / 3) +
                      (newPassword.length >= 8 ? 1 : 0) +
                      (/[A-Z]/.test(newPassword) ? 1 : 0) +
                      (/[0-9!@#$%^&*]/.test(newPassword) ? 1 : 0),
                      4
                    );
                    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? colors[strength - 1] : 'bg-[var(--color-border)]'
                        }`}
                      />
                    );
                  })}
                </div>
              )}
              {fieldErrors.newPassword && (
                <p className="font-inter text-[10px] text-red-400 mt-2">{fieldErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                className="block font-inter text-[10px] uppercase tracking-widest mb-3 transition-colors duration-200"
                style={{ color: focused === 'confirm' ? 'var(--color-gold)' : 'var(--color-subtle)' }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  required
                  disabled={isLoading}
                  placeholder="Repeat your password"
                  className="w-full pl-4 pr-10 py-3 font-inter text-sm border border-[var(--color-border)] rounded-[14px] bg-[color-mix(in_srgb,var(--color-surface)_82%,white_18%)] focus:outline-none focus:border-[var(--color-gold)] disabled:opacity-50 transition-colors"
                  style={{
                    borderColor:
                      confirmPassword.length > 0 && confirmPassword === newPassword
                        ? 'var(--color-gold)'
                        : undefined,
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="font-inter text-[10px] text-red-400 mt-2">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group ios-button-primary flex items-center justify-between font-inter uppercase tracking-[0.08em] text-sm px-7 py-4 disabled:opacity-60"
            >
              <span>{isLoading ? 'Updating…' : 'Update Password'}</span>
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
            <Link
              href="/auth/login"
              className="font-inter text-[12px] text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}

export default function ResetPasswordPage() {
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
            Whispers of Dawn
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
          <Link href="/" className="inline-block mb-14">
            <span className="font-playfair text-[12px] uppercase tracking-[0.14em] text-[var(--color-gold)]">
              Artkezai
            </span>
          </Link>

          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-[var(--color-surface)] rounded-[14px]" />
              <div className="h-4 bg-[var(--color-surface)] rounded w-3/4" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
