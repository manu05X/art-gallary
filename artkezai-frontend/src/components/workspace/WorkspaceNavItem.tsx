'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

export interface WorkspaceNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface WorkspaceNavItemProps extends WorkspaceNavLink {
  /** "sidebar" — vertical desktop list item. "tab" — horizontal mobile pill. */
  variant?: 'sidebar' | 'tab';
}

export default function WorkspaceNavItem({ href, label, icon: Icon, variant = 'sidebar' }: WorkspaceNavItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  if (variant === 'tab') {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-inter text-sm font-medium transition-colors ${
          active
            ? 'bg-brand text-white'
            : 'bg-white text-gray-600 border border-workspace-border hover:bg-workspace'
        }`}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-brand text-white' : 'text-gray-700 hover:bg-workspace'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}
