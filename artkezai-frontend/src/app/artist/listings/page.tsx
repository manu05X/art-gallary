'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMyListings } from '@/lib/hooks/usePaintings';
import { PaintingStatus } from '@/types';

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<PaintingStatus>(PaintingStatus.LIVE);
  const { data, isLoading, error } = useMyListings(1);

  const allListings = data?.data || [];
  const filteredListings = allListings.filter((p) => p.status === activeTab);

  const tabs = [
    { value: PaintingStatus.DRAFT, label: 'Draft' },
    { value: PaintingStatus.UNDER_REVIEW, label: 'Under Review' },
    { value: PaintingStatus.LIVE, label: 'Live' },
    { value: PaintingStatus.SOLD, label: 'Sold' },
  ];

  const getStatusBadgeColor = (status: PaintingStatus) => {
    switch (status) {
      case PaintingStatus.DRAFT:
        return 'badge-gray';
      case PaintingStatus.UNDER_REVIEW:
        return 'badge-warning';
      case PaintingStatus.LIVE:
        return 'badge-success';
      case PaintingStatus.SOLD:
        return 'badge-primary';
      default:
        return 'badge-gray';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Failed to load listings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand mb-4">My Listings</h1>

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const count = allListings.filter((p) => p.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === tab.value
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-600 mb-4">No {activeTab.toLowerCase()} paintings yet.</p>
          <Link href="/artist/submit" className="text-accent font-semibold hover:underline">
            Submit your first painting →
          </Link>
        </div>
      ) : (
        <div className="divide-y">
          {filteredListings.map((painting) => (
            <div key={painting.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex gap-6">
                {painting.primaryImage && (
                  <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={painting.primaryImage.url}
                      alt={painting.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand mb-2">{painting.title}</h3>

                  <div className="flex items-center gap-4 mb-3">
                    <span className={`badge ${getStatusBadgeColor(painting.status)}`}>
                      {painting.status}
                    </span>
                    <span className="text-sm text-gray-600">{painting.mediumName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="font-semibold text-accent">
                        ${painting.price.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Category</p>
                      <p className="font-semibold text-gray-800">{painting.categoryName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(painting.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/painting/${painting.slug}`}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      View Painting
                    </Link>
                    {(painting.status === PaintingStatus.DRAFT ||
                      painting.status === PaintingStatus.LIVE) && (
                      <Link
                        href={`/artist/submit?id=${painting.id}`}
                        className="text-sm font-semibold text-brand hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
