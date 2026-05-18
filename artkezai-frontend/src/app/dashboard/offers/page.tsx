'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMyOffers, useWithdrawOffer } from '@/lib/hooks/useOffers';
import { OfferStatusBadge } from '@/components/offer/OfferStatusBadge';
import { OfferStatus } from '@/types';

export default function MyOffersPage() {
  const { data, isLoading, error } = useMyOffers();
  const { mutate: withdrawOffer, isPending } = useWithdrawOffer();

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
        <p className="text-red-800">Failed to load offers. Please try again.</p>
      </div>
    );
  }

  const offers = data?.data || [];

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 mb-4">You haven't made any offers yet.</p>
        <Link href="/gallery" className="text-accent font-semibold hover:underline">
          Browse the gallery →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand">My Offers</h1>
      </div>

      <div className="divide-y">
        {offers.map((offer) => (
          <div key={offer.id} className="p-6">
            <div className="flex gap-6">
              {offer.paintingThumbnailUrl && (
                <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={offer.paintingThumbnailUrl}
                    alt={offer.paintingTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <Link
                  href="/gallery"
                  className="text-lg font-semibold text-brand hover:text-accent transition"
                >
                  {offer.paintingTitle}
                </Link>

                <div className="flex items-center gap-4 mt-2">
                  <OfferStatusBadge status={offer.status} />
                  <span className="text-sm text-gray-600">
                    Offer: ${offer.offerAmount.toLocaleString()} {offer.currency}
                  </span>
                </div>

                {offer.counterAmount && (
                  <div className="mt-2">
                    <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
                      Counter offer: ${offer.counterAmount.toLocaleString()} {offer.currency}
                    </p>
                  </div>
                )}

                {offer.buyerMessage && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{offer.buyerMessage}"</p>
                )}

                {(offer.status === OfferStatus.SUBMITTED || offer.status === OfferStatus.COUNTERED) && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => withdrawOffer(offer.id)}
                      disabled={isPending}
                      className="btn btn-outline text-sm disabled:opacity-50"
                    >
                      Withdraw Offer
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {offer.status === OfferStatus.SUBMITTED && (
                    <>Expires: {new Date(offer.expiresAt).toLocaleDateString()}</>
                  )}
                  {offer.status === OfferStatus.EXPIRED && 'This offer has expired'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
