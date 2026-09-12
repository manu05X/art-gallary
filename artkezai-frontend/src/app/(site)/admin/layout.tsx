'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
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
import WorkspaceShell from '@/components/workspace/WorkspaceShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    } else if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'admin') {
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
    <WorkspaceShell title="Admin Console" navItems={navItems}>
      {children}
    </WorkspaceShell>
  );
}
