'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { UserRole } from '@/types';
import { Upload, Gallery, User, MessageSquare, BarChart3 } from 'lucide-react';

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== UserRole.ARTIST) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== UserRole.ARTIST) {
    return null;
  }

  const navItems = [
    { href: '/artist', label: 'Overview', icon: BarChart3 },
    { href: '/artist/submit', label: 'Submit Painting', icon: Upload },
    { href: '/artist/listings', label: 'My Listings', icon: Gallery },
    { href: '/artist/profile', label: 'Profile & Story', icon: User },
    { href: '/artist/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="section container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-brand mb-6">Artist Dashboard</h2>
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
