'use client';

import { OfferStatus } from '@/types';

interface OfferStatusBadgeProps {
  status: OfferStatus;
}

export function OfferStatusBadge({ status }: OfferStatusBadgeProps) {
  const statusConfig: Record<OfferStatus, { bg: string; text: string; label: string }> = {
    [OfferStatus.SUBMITTED]: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
    [OfferStatus.COUNTERED]: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Countered' },
    [OfferStatus.ACCEPTED]: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
    [OfferStatus.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    [OfferStatus.EXPIRED]: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired' },
    [OfferStatus.WITHDRAWN]: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Withdrawn' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
