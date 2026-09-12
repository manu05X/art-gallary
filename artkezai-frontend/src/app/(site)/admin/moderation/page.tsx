'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ImageOff } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';
import toast from 'react-hot-toast';

export default function ModerationPage() {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: () => adminApi.getModerationQueue(),
  });

  const paintings = data || [];

  const handleApprove = async (paintingId: string) => {
    try {
      await adminApi.approvePainting(paintingId);
      toast.success('Painting approved');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve painting');
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await adminApi.rejectPainting(rejectingId, rejectReason || 'No reason provided');
      toast.success(`Painting rejected: ${rejectReason || 'No reason provided'}`);
      setRejectingId(null);
      setRejectReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject painting');
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
        <p className="text-[#9c1f1f]">Failed to load moderation queue. Please try again.</p>
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div>
        <WorkspacePageHeader eyebrow="Admin Workspace" title="Moderation Queue" />
        <div className="bg-white rounded-lg shadow p-16 text-center">
          <p className="font-playfair text-xl text-brand mb-2">Queue is clear</p>
          <p className="font-inter text-sm text-gray-600">No paintings are currently pending review.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WorkspacePageHeader
        eyebrow="Admin Workspace"
        title="Moderation Queue"
        description={`${paintings.length} painting${paintings.length === 1 ? '' : 's'} awaiting review`}
      />

      <div className="space-y-4">
        {paintings.map((painting) => (
          <div key={painting.id} className="bg-white rounded-lg shadow p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 w-full sm:w-48 aspect-square relative rounded-lg overflow-hidden bg-workspace">
              {painting.primaryImageUrl ? (
                <Image
                  src={painting.primaryImageUrl}
                  alt={painting.title}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff size={32} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-playfair text-xl text-brand leading-snug">{painting.title}</h3>
                <span className="badge badge-warning shrink-0">Under Review</span>
              </div>
              <p className="font-inter text-sm text-gray-500 mb-4">by {painting.artistName}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 font-inter text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Price</p>
                  <p className="font-playfair text-lg text-accent">${painting.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Medium</p>
                  <p className="text-gray-800">{painting.mediumName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Category</p>
                  <p className="text-gray-800">{painting.categoryName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Submitted</p>
                  <p className="text-gray-800">{new Date(painting.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleApprove(painting.id)} className="btn btn-primary">
                  Approve
                </button>
                <button
                  onClick={() => setRejectingId(painting.id)}
                  className="btn btn-outline !border-[#f3c9c9] !text-[#9c1f1f] hover:!bg-[#fbe4e4]"
                >
                  Reject
                </button>
                <button className="font-inter text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2">
                  Request Changes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="font-playfair text-xl text-brand mb-4">Reject Painting</h2>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              className="input resize-none h-24 mb-4 w-full"
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
