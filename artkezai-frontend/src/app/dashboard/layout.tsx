'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { UserRole } from '@/types';
import { LayoutGrid, ShoppingBag, MessageSquare, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-brand mb-6">Dashboard</h2>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
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
