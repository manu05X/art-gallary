'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ImageOff } from 'lucide-react';
import { useMyListings, useSubmitForReview } from '@/lib/hooks/usePaintings';
import { PaintingStatus } from '@/types';
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<PaintingStatus>(PaintingStatus.APPROVED);
  const { data, isLoading, error } = useMyListings(1);
  const { mutate: submitForReview, isPending: isSubmitting } = useSubmitForReview();

  const allListings = data?.data || [];
  const filteredListings = allListings.filter((p) => p.status === activeTab);

  const tabs = [
    { value: PaintingStatus.DRAFT, label: 'Draft' },
    { value: PaintingStatus.UNDER_REVIEW, label: 'Under Review' },
    { value: PaintingStatus.APPROVED, label: 'Approved' },
    { value: PaintingStatus.REJECTED, label: 'Rejected' },
    { value: PaintingStatus.SOLD, label: 'Sold' },
  ];

  const getStatusBadgeColor = (status: PaintingStatus) => {
    switch (status) {
      case PaintingStatus.DRAFT:
        return 'badge-gray';
      case PaintingStatus.UNDER_REVIEW:
        return 'badge-warning';
      case PaintingStatus.APPROVED:
        return 'badge-success';
      case PaintingStatus.REJECTED:
        return 'badge-danger';
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
      <div className="bg-[#fbe4e4] border border-[#f3c9c9] rounded-lg p-6">
        <p className="text-[#9c1f1f]">Failed to load listings. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <WorkspacePageHeader
        eyebrow="Artist Workspace"
        title="My Listings"
        description="Track every painting from first draft to sale."
      />

      <div className="bg-white rounded-lg shadow p-2 mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const count = allListings.filter((p) => p.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 rounded-lg font-inter text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.value
                  ? 'bg-brand text-white'
                  : 'text-gray-600 hover:bg-workspace'
              }`}
            >
              {tab.label} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-16 text-center">
          <p className="font-playfair text-xl text-brand mb-2">
            No {activeTab.toLowerCase().replace('_', ' ')} paintings yet
          </p>
          <p className="font-inter text-sm text-gray-600 mb-6">
            Once you have work in this stage, it will appear here.
          </p>
          <Link href="/artist/submit" className="text-accent font-semibold hover:underline">
            Submit your first painting →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((painting) => (
            <div
              key={painting.id}
              className="bg-white rounded-lg shadow p-5 sm:p-6 flex flex-col sm:flex-row gap-5"
            >
              <div className="flex-shrink-0 w-full sm:w-40 aspect-square relative rounded-lg overflow-hidden bg-workspace">
                {painting.primaryImageUrl ? (
                  <Image
                    src={painting.primaryImageUrl}
                    alt={painting.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageOff size={28} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-playfair text-lg text-brand leading-snug">{painting.title}</h3>
                  <span className={`badge ${getStatusBadgeColor(painting.status)} shrink-0`}>
                    {painting.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="font-playfair text-2xl text-accent mb-3">
                  ${painting.price.toLocaleString()}
                </p>

                <div className="flex flex-wrap gap-x-5 gap-y-1 font-inter text-xs text-gray-500 mb-5">
                  <span>{painting.mediumName || 'Medium not set'}</span>
                  <span>{painting.categoryName || 'Category not set'}</span>
                  <span>Created {new Date(painting.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {painting.status === PaintingStatus.DRAFT && (
                    <button
                      type="button"
                      onClick={() => submitForReview(painting.id)}
                      disabled={isSubmitting}
                      className="btn btn-primary"
                    >
                      Submit for Review
                    </button>
                  )}
                  <Link href={`/painting/${painting.slug}`} className="btn btn-outline">
                    View Painting
                  </Link>
                  {(painting.status === PaintingStatus.DRAFT ||
                    painting.status === PaintingStatus.APPROVED) && (
                    <Link
                      href={`/artist/submit?id=${painting.id}`}
                      className="font-inter text-sm font-semibold text-gray-500 hover:text-brand transition-colors"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
