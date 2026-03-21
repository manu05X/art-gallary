'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/lib/store/authStore';

const navLinks = [
  { label: 'Gallery', href: '/gallery' },
  { label: 'Artists', href: '/artists' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  // Get user initials from displayName
  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    const parts = user.displayName.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'pt-3'
          : 'pt-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="ios-glass rounded-[26px] px-5 sm:px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <span className="font-playfair text-lg tracking-[0.12em] text-cream font-semibold">
            ARTKEZAI
          </span>
          <span className="block font-inter text-[9px] uppercase tracking-[0.16em] text-muted">
            Gallery
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2 p-1 ios-pill">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-inter text-[11px] uppercase tracking-[0.08em] relative px-4 py-2 rounded-full transition-all duration-300 ${
                isActive(link.href)
                  ? 'bg-white/60 dark:bg-white/10 text-cream shadow-sm'
                  : 'text-muted hover:text-cream hover:bg-white/35 dark:hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button className="ios-button-secondary inline-flex h-10 w-10 items-center justify-center text-muted hover:text-cream">
            <Search size={18} />
          </button>

          <div className="hidden lg:block w-px h-5 bg-border/75" />

          {mounted && (
            <>
              {isAuthenticated ? (
                <>
                  {/* User Display */}
                  <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5">
                    {user?.avatar ? (
                      // Avatar Image
                      <img
                        src={user.avatar}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-white/30 dark:border-white/20"
                      />
                    ) : (
                      // Avatar Initials Fallback
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-orange-400 flex items-center justify-center border border-white/30 dark:border-white/20">
                        <span className="font-inter text-[9px] font-semibold text-cream">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                    <span className="font-inter text-[11px] text-cream truncate max-w-[100px]">
                      {user?.displayName || 'User'}
                    </span>
                  </div>

                  <Link
                    href={user?.role === 'artist' ? '/artist' : user?.role === 'admin' ? '/admin' : '/dashboard'}
                    className="hidden lg:block font-inter text-[11px] uppercase tracking-[0.06em] ios-button-secondary px-5 py-2.5"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="hidden lg:block font-inter text-[11px] uppercase tracking-[0.06em] px-5 py-2.5 ios-button-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hidden lg:block font-inter text-[11px] uppercase tracking-[0.06em] ios-button-secondary px-5 py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden lg:block font-inter text-[11px] uppercase tracking-[0.06em] px-5 py-2.5 ios-button-primary"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden ios-button-secondary inline-flex h-10 w-10 items-center justify-center text-cream"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-[92px] px-4 sm:px-6 z-40">
          <div className="ios-glass rounded-[26px] p-6">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`font-playfair text-2xl px-4 py-3 rounded-2xl transition-colors duration-300 ${
                  isActive(link.href) ? 'text-cream bg-white/45 dark:bg-white/10' : 'text-cream hover:text-gold hover:bg-white/20 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {mounted && (
              <div className="pt-6 border-t border-border/80 flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    {/* User Display Mobile */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      {user?.avatar ? (
                        // Avatar Image
                        <img
                          src={user.avatar}
                          alt={user.displayName || 'User'}
                          className="w-10 h-10 rounded-full object-cover border border-white/30 dark:border-white/20 flex-shrink-0"
                        />
                      ) : (
                        // Avatar Initials Fallback
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-orange-400 flex items-center justify-center border border-white/30 dark:border-white/20 flex-shrink-0">
                          <span className="font-inter text-xs font-semibold text-cream">
                            {getUserInitials()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium text-cream truncate">
                          {user?.displayName || 'User'}
                        </p>
                        <p className="font-inter text-xs text-muted capitalize">
                          {user?.role || 'buyer'}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={user?.role === 'artist' ? '/artist' : user?.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setMenuOpen(false)}
                      className="font-inter text-sm ios-button-secondary px-5 py-3 text-center"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="font-inter text-sm ios-button-primary px-5 py-3 text-center"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="font-inter text-sm ios-button-secondary px-5 py-3 text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMenuOpen(false)}
                      className="font-inter text-sm ios-button-primary px-5 py-3 text-center"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </nav>
          </div>
        </div>
      )}
    </header>
  );
}
