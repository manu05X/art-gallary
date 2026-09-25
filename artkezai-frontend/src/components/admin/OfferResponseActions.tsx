'use client';

import { useState } from 'react';
import { useRespondToOffer } from '@/lib/hooks/useOffers';
import { OfferAction, OfferDto } from '@/types';

// Admin controls for an offer still waiting on the gallery (SUBMITTED).
// Accepting creates the buyer's order at the offer amount; countering hands
// the decision back to the buyer.
export function OfferResponseActions({ offer }: { offer: OfferDto }) {
  const { mutate: respond, isPending } = useRespondToOffer();
  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [message, setMessage] = useState('');

  const submit = (action: OfferAction) => {
    const amount = Number(counterAmount);
    if (action === OfferAction.COUNTER && !(amount > 0)) return;
    respond({
      offerId: offer.id,
      req: {
        action,
        counterAmount: action === OfferAction.COUNTER ? amount : undefined,
        message: message.trim() || undefined,
      },
    });
  };

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message to the buyer (optional)"
        rows={2}
        className="w-full rounded-md border border-gray-300 p-2 text-sm"
      />
      {showCounter && (
        <input
          type="number"
          min="1"
          step="0.01"
          value={counterAmount}
          onChange={(e) => setCounterAmount(e.target.value)}
          placeholder={`Counter amount (${offer.currency})`}
          className="w-full rounded-md border border-gray-300 p-2 text-sm"
        />
      )}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => submit(OfferAction.ACCEPT)} disabled={isPending} className="btn btn-primary text-sm disabled:opacity-50">
          Accept
        </button>
        {showCounter ? (
          <button
            onClick={() => submit(OfferAction.COUNTER)}
            disabled={isPending || !(Number(counterAmount) > 0)}
            className="btn btn-outline text-sm disabled:opacity-50"
          >
            Send Counter
          </button>
        ) : (
          <button onClick={() => setShowCounter(true)} disabled={isPending} className="btn btn-outline text-sm disabled:opacity-50">
            Counter
          </button>
        )}
        <button onClick={() => submit(OfferAction.REJECT)} disabled={isPending} className="btn btn-outline text-sm text-red-700 disabled:opacity-50">
          Reject
        </button>
      </div>
    </div>
  );
}
