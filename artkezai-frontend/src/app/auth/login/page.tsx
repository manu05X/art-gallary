'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { LoginRequest, UserRole } from '@/types';
import toast from 'react-hot-toast';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=90';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({ email: '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!mounted || isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      login(
        {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          displayName: `${response.user.firstName} ${response.user.lastName}`.trim(),
          role: response.user.role.toLowerCase() as 'buyer' | 'artist' | 'admin',
        },
        response.token
      );
      toast.success('Welcome back.');
      const redirect =
        response.user.role === UserRole.ARTIST
          ? '/artist'
          : response.user.role === UserRole.ADMIN
          ? '/admin'
          : '/dashboard';
      router.push(redirect);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-dark)] flex">
      {/* LEFT — Painting Panel */}
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

        {/* Caption */}
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-playfair text-[10px] uppercase tracking-[0.14em] text-[var(--color-gold)] mb-2">
            Artkezai Collection
          </p>
          <p className="font-playfair text-2xl text-[var(--color-cream)] leading-snug">
            Twilight Over the Valley
          </p>
          <p className="font-inter text-[10px] uppercase tracking-[0.08em] text-[var(--color-muted)] mt-1">
            James Whitfield · Acrylic on Canvas
          </p>
        </div>
      </div>

      {/* Vertical gold divider */}
      <div className="hidden lg:block w-px bg-[var(--color-surface)] relative">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 bg-[var(--color-gold)]/50 origin-top"
        />
      </div>

      {/* RIGHT — Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-16 py-16">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm mx-auto lg:mx-0"
        >
          {/* Brand wordmark */}
          <Link href="/" className="inline-block mb-14">
            <span className="font-playfair text-[12px] uppercase tracking-[0.14em] text-[var(--color-gold)]">
              Artkezai
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-playfair text-4xl md:text-5xl text-[var(--color-cream)] leading-tight mb-3"
            >
              Welcome<br />back.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="font-inter text-sm text-[var(--color-muted)]"
            >
              Sign in to continue to your collection.
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email field */}
            <div className="relative group">
              <label
                className="block font-inter text-[10px] uppercase tracking-widest mb-3 transition-colors duration-200"
                style={{ color: focused === 'email' ? 'var(--color-gold)' : 'var(--color-subtle)' }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 font-inter text-sm border border-[var(--color-border)] rounded-[14px] bg-[color-mix(in_srgb,var(--color-surface)_82%,white_18%)] focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <label
                className="block font-inter text-[10px] uppercase tracking-widest mb-3 transition-colors duration-200"
                style={{ color: focused === 'password' ? 'var(--color-gold)' : 'var(--color-subtle)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  required
                  disabled={isLoading}
                  className="w-full pl-4 pr-10 py-3 font-inter text-sm border border-[var(--color-border)] rounded-[14px] bg-[color-mix(in_srgb,var(--color-surface)_82%,white_18%)] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right -mt-4">
              <Link
                href="/auth/forgot-password"
                className="font-inter text-[11px] uppercase tracking-[0.08em] text-[var(--color-subtle)] hover:text-[var(--color-gold)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group ios-button-primary flex items-center justify-between font-inter uppercase tracking-[0.08em] text-sm px-7 py-4 disabled:opacity-60"
            >
              <span>{isLoading ? 'Signing in…' : 'Sign In'}</span>
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[var(--color-bg)] border-t-transparent rounded-full"
                />
              ) : (
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-12 pt-8 border-t border-[var(--color-border)] space-y-3">
            <p className="font-inter text-[12px] text-[var(--color-subtle)]">
              New to Artkezai?{' '}
              <Link
                href="/auth/register"
                className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors"
              >
                Create an account →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
