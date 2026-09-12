'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { Upload, Grid3x3, User, MessageSquare, BarChart3 } from 'lucide-react';
import WorkspaceShell from '@/components/workspace/WorkspaceShell';

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== 'artist') {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'artist') {
    return null;
  }

  const navItems = [
    { href: '/artist', label: 'Overview', icon: BarChart3 },
    { href: '/artist/submit', label: 'Submit Painting', icon: Upload },
    { href: '/artist/listings', label: 'My Listings', icon: Grid3x3 },
    { href: '/artist/profile', label: 'Profile & Story', icon: User },
    { href: '/artist/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <WorkspaceShell title="Artist Dashboard" navItems={navItems}>
      {children}
    </WorkspaceShell>
  );
}
