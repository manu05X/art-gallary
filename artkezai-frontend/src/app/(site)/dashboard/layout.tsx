'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { ShoppingBag, MessageSquare, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  // Wait for the persisted session to load before deciding the user is
  // signed out; otherwise a reload or deep link bounces through the login page.
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Profile', icon: Settings },
    { href: '/dashboard/offers', label: 'My Offers', icon: ShoppingBag },
    { href: '/dashboard/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="section container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--ios-radius-lg)] shadow-[var(--ios-shadow-sm)] p-6">
            <h2 className="text-xl font-bold text-[var(--color-cream)] mb-6">Dashboard</h2>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-cream)] hover:bg-[var(--color-surface-hover)] transition"
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
