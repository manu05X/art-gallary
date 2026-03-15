'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { paintingsApi } from '@/lib/api/paintings';
import { PaintingStatus } from '@/types';
import toast from 'react-hot-toast';

export default function ModerationPage() {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: () => paintingsApi.getGallery({ categoryId: '' }, 1),
  });

  const paintings = data?.data.filter((p) => p.status === PaintingStatus.UNDER_REVIEW) || [];

  const handleApprove = async (paintingId: string) => {
    try {
      await paintingsApi.updatePainting(paintingId, { categoryId: '' });
      toast.success('Painting approved');
      refetch();
    } catch (error) {
      toast.error('Failed to approve painting');
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await paintingsApi.updatePainting(rejectingId, { categoryId: '' });
      toast.success(`Painting rejected: ${rejectReason || 'No reason provided'}`);
      setRejectingId(null);
      setRejectReason('');
      refetch();
    } catch (error) {
      toast.error('Failed to reject painting');
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
        <p className="text-red-800">Failed to load moderation queue. Please try again.</p>
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 mb-4">No paintings pending review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand">Moderation Queue</h1>
        <p className="text-sm text-gray-600 mt-2">{paintings.length} paintings awaiting review</p>
      </div>

      <div className="divide-y">
        {paintings.map((painting) => (
          <div key={painting.id} className="p-6">
            <div className="flex gap-6">
              {painting.primaryImage && (
                <div className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100">
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

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Artist:</span> {painting.artistName}
                  </p>
                  <p>
                    <span className="font-medium">Medium:</span> {painting.mediumName}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span> {painting.categoryName}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> ${painting.price.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Submitted:</span>{' '}
                    {new Date(painting.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(painting.id)}
                    className="btn btn-primary"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(painting.id)}
                    className="btn btn-outline"
                  >
                    Reject
                  </button>
                  <button className="btn btn-secondary">Request Changes</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-brand mb-4">Reject Painting</h2>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              className="input resize-none h-24 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button onClick={handleReject} className="flex-1 btn btn-primary">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
