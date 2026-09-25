'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/lib/api/payments';
import { parseApiError } from '@/lib/api/utils';
import { trackEvent } from '@/lib/analytics';

// Card payment for an ONLINE order. The backend creates (or reuses) the
// order's Stripe PaymentIntent; the card is confirmed here with Stripe's
// Payment Element, and the order moves to PAID via the Stripe webhook or,
// as a fallback, the sync call made right after a successful confirmation.
export default function PayOrderPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const searchParams = useSearchParams();
  const returnedFromRedirect = searchParams.get('redirect_status') === 'succeeded';

  const { data: intent, isLoading, error } = useQuery({
    queryKey: ['payment-intent', orderId],
    queryFn: () => paymentsApi.createPaymentIntent({ orderId }),
    enabled: Number.isFinite(orderId) && !returnedFromRedirect,
    staleTime: Infinity,
    retry: false,
  });

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || intent?.publishableKey;
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

  if (returnedFromRedirect) {
    return <PaymentComplete orderId={orderId} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error || !intent?.clientSecret || !stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">
          {error ? parseApiError(error, 'Unable to start payment.').message : 'Online payment is not configured.'}
        </p>
        <Link href="/dashboard/orders" className="text-accent font-semibold hover:underline mt-3 inline-block">
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-brand mb-2">Pay for Order #{orderId}</h1>
      <p className="text-sm text-gray-600 mb-6">Payments are processed securely by Stripe.</p>
      <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
        <CardPaymentForm orderId={orderId} />
      </Elements>
    </div>
  );
}

function CardPaymentForm({ orderId }: { orderId: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard/orders/${orderId}/pay` },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      trackEvent('payment_succeeded', { orderId });
      await paymentsApi.syncPayment(orderId).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Payment received. Thank you!');
      router.push('/dashboard/orders');
      return;
    }

    toast('Payment is processing. Your order will update shortly.');
    router.push('/dashboard/orders');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button type="submit" disabled={!stripe || submitting} className="btn btn-primary w-full disabled:opacity-50">
        {submitting ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}

// Stripe sends the buyer back here after a redirect-based payment method
// (e.g. 3-D Secure). Reconcile once, then return to the orders list.
function PaymentComplete({ orderId }: { orderId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    paymentsApi
      .syncPayment(orderId)
      .catch(() => undefined)
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        toast.success('Payment received. Thank you!');
        router.replace('/dashboard/orders');
      });
  }, [orderId, queryClient, router]);

  return <p className="text-gray-600">Confirming your payment…</p>;
}
