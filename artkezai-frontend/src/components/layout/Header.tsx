'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';

const navLinks = [
  { label: 'Gallery', href: '/gallery' },
  { label: 'Artists', href: '/artists' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0F0F0F]/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <span className="font-playfair text-lg tracking-[0.2em] text-cream">
            ARTKEZAI
          </span>
          <span className="block font-inter text-[8px] uppercase tracking-[0.3em] text-muted">
            Gallery
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-inter text-[11px] uppercase tracking-[0.15em] relative pb-1 transition-colors duration-300 ${
                isActive(link.href)
                  ? 'text-cream'
                  : 'text-muted hover:text-cream'
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-0 h-px bg-gold transition-all duration-300 ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          <button className="p-2 text-muted hover:text-cream transition-colors duration-300">
            <Search size={18} />
          </button>

          <div className="hidden lg:block w-px h-5 bg-border" />

          <Link
            href="/auth/login"
            className="hidden lg:block font-inter text-[11px] uppercase tracking-[0.12em] text-muted hover:text-cream transition-colors duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="hidden lg:block font-inter text-[11px] uppercase tracking-[0.12em] px-5 py-2.5 border border-gold text-gold hover:bg-gold hover:text-dark transition-all duration-300"
          >
            Register
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-cream"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-dark z-40">
          <nav className="flex flex-col gap-8 p-8 pt-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`font-playfair text-2xl transition-colors duration-300 ${
                  isActive(link.href) ? 'text-gold' : 'text-cream hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 border-t border-border flex flex-col gap-4">
              <Link href="/auth/login" className="font-inter text-sm text-muted">
                Sign In
              </Link>
              <Link href="/auth/register" className="font-inter text-sm text-gold">
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
