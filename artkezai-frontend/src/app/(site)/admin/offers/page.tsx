'use client';

import { useAllOffers } from '@/lib/hooks/useOffers';
import { OfferStatusBadge } from '@/components/offer/OfferStatusBadge';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminOffersPage() {
  const { data, isLoading, error } = useAllOffers();

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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand">All Offers</h1>
        <p className="text-sm text-gray-600 mt-2">{offers.length} total offers</p>
      </div>

      {offers.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-600">No offers yet.</p>
        </div>
      ) : (
        <div className="divide-y">
          {offers.map((offer) => (
            <div key={offer.id} className="p-6 hover:bg-gray-50 transition">
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
                      ${offer.offerAmount.toLocaleString()} {offer.currency} from {offer.buyerName}
                    </span>
                  </div>

                  {offer.counterAmount && (
                    <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded mt-2 inline-block">
                      Counter: ${offer.counterAmount.toLocaleString()} {offer.currency}
                    </p>
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
