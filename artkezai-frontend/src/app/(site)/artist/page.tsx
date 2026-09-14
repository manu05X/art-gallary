'use client';

import { useMyListings } from '@/lib/hooks/usePaintings';
import { useMyArtistOrders } from '@/lib/hooks/useArtists';
import { PaintingStatus } from '@/types';
import { BarChart3, FileEdit, ShoppingBag, Eye } from 'lucide-react';

export default function ArtistDashboardPage() {
  const { data: listings, isLoading: isListingsLoading, isError: isListingsError, refetch: refetchListings } = useMyListings(1);
  const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError, refetch: refetchOrders } = useMyArtistOrders(1);

  const isLoading = isListingsLoading || isOrdersLoading;
  const isError = isListingsError || isOrdersError;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg p-6 bg-gray-100 animate-pulse h-[104px]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-16 text-center">
        <p className="font-playfair text-xl text-brand mb-2">Couldn&apos;t load your dashboard</p>
        <p className="font-inter text-sm text-gray-600 mb-6">Please try again.</p>
        <button
          onClick={() => {
            refetchListings();
            refetchOrders();
          }}
          className="btn btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const allListings = listings?.data || [];

  // Approved/Draft counts reflect the loaded page of listings (page 1, size
  // 20) — the same client-side count already used by /artist/listings'
  // status tabs, not a separate aggregate query.
  const stats = [
    {
      label: 'Total Listings',
      value: listings?.totalCount ?? 0,
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Approved',
      value: allListings.filter((p) => p.status === PaintingStatus.APPROVED).length,
      icon: Eye,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Draft',
      value: allListings.filter((p) => p.status === PaintingStatus.DRAFT).length,
      icon: FileEdit,
      color: 'bg-gray-200 text-gray-700',
    },
    {
      label: 'Orders',
      value: orders?.totalCount ?? 0,
      icon: ShoppingBag,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`rounded-lg p-6 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon size={32} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-brand mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-gray-600">
          <p>Activity will appear here as your paintings get views and orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-brand mb-4">Quick Tips</h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Upload high-quality images of your paintings for better visibility</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Write detailed descriptions to help buyers understand your work</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Consider making offers competitive to attract more buyers</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Engage with potential buyers through messages</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
