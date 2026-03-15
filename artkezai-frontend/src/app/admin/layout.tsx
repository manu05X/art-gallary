'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { UserRole } from '@/types';
import {
  LayoutGrid,
  CheckSquare,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Users,
  Settings,
  TrendingUp,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== UserRole.ADMIN) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/moderation', label: 'Moderation', icon: CheckSquare },
    { href: '/admin/offers', label: 'Offers', icon: ShoppingBag },
    { href: '/admin/orders', label: 'Orders', icon: TrendingUp },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/content', label: 'Content', icon: Settings },
  ];

  return (
    <div className="section container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-brand mb-6">Admin Console</h2>
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
