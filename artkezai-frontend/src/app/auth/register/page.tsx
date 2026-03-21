'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { RegisterRequest, UserRole } from '@/types';
import toast from 'react-hot-toast';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=90';

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [focused, setFocused] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.BUYER,
  });

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setFormData({ ...formData, role: newRole });
  };

  if (!mounted || isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);
    try {
      const response = await authApi.register(formData);
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
      toast.success('Welcome to Artkezai.');
      router.push(role === UserRole.ARTIST ? '/artist' : '/dashboard');
    } catch (error: any) {
      const apiMessage = error.response?.data?.message;
      const backendFieldErrors = error.response?.data?.errors;
      if (backendFieldErrors && typeof backendFieldErrors === 'object') {
        setFieldErrors(backendFieldErrors);
      }
      const validationMessage =
        backendFieldErrors && typeof backendFieldErrors === 'object'
          ? Object.values(backendFieldErrors)[0]
          : undefined;
      toast.error((validationMessage as string) || apiMessage || 'Registration failed. Please try again.');
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
            Amber Reverie
          </p>
          <p className="font-inter text-[10px] uppercase tracking-[0.08em] text-[var(--color-muted)] mt-1">
            Elena Morozova · Oil on Canvas
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
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-16 py-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-sm mx-auto lg:mx-0"
        >
          {/* Brand wordmark */}
          <Link href="/" className="inline-block mb-12">
            <span className="font-playfair text-[12px] uppercase tracking-[0.14em] text-[var(--color-gold)]">
              Artkezai
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-9">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-playfair text-4xl md:text-5xl text-[var(--color-cream)] leading-tight mb-3"
            >
              Join the<br />gallery.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="font-inter text-sm text-[var(--color-muted)]"
            >
              Create your free account today.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Role selector */}
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.08em] text-[var(--color-subtle)] mb-3">
                I am a
              </p>
              <div className="flex gap-0 border border-[var(--color-border)] rounded-[14px] overflow-hidden">
                {[
                  { label: 'Collector', value: UserRole.BUYER },
                  { label: 'Artist', value: UserRole.ARTIST },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleRoleChange(opt.value)}
                    className="flex-1 py-3 font-inter text-xs uppercase tracking-widest transition-all duration-200"
                    style={{
                      background: role === opt.value ? 'var(--color-gold)' : 'transparent',
                      color: role === opt.value ? 'var(--color-dark)' : 'var(--color-muted)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-5">
              {(['firstName', 'lastName'] as const).map((field) => (
                <div key={field}>
                  <label
                    className="block font-inter text-[10px] uppercase tracking-widest mb-3 transition-colors duration-200"
                    style={{ color: focused === field ? 'var(--color-gold)' : 'var(--color-subtle)' }}
                  >
                    {field === 'firstName' ? 'First' : 'Last'}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    onFocus={() => setFocused(field)}
                    onBlur={() => setFocused(null)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 font-inter text-sm border border-[var(--color-border)] rounded-[14px] bg-[color-mix(in_srgb,var(--color-surface)_82%,white_18%)] focus:outline-none disabled:opacity-50"
                  />
                  {fieldErrors[field] && (
                    <p className="font-inter text-[10px] text-red-400 mt-2">{fieldErrors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
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
              {fieldErrors.email && (
                <p className="font-inter text-[10px] text-red-400 mt-2">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
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
                  minLength={8}
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
              <p className="font-inter text-[10px] text-[var(--color-subtle)] mt-2">Minimum 8 characters</p>
              {fieldErrors.password && (
                <p className="font-inter text-[10px] text-red-400 mt-2">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group ios-button-primary flex items-center justify-between font-inter uppercase tracking-[0.08em] text-sm px-7 py-4 disabled:opacity-60"
            >
              <span>{isLoading ? 'Creating Account…' : 'Create Account'}</span>
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

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
            <p className="font-inter text-[12px] text-[var(--color-subtle)]">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
