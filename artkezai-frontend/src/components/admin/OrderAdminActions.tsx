'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi } from '@/lib/api/orders';
import { paymentsApi } from '@/lib/api/payments';
import { parseApiError } from '@/lib/api/utils';
import { OrderDto, OrderStatus, PaymentMethod, PaymentStatus, UpdateShippingRequest } from '@/types';

const SHIPPING_STEPS = [OrderStatus.SHIPPING_IN_PROGRESS, OrderStatus.SHIPPED, OrderStatus.DELIVERED] as const;

// The admin's next step for an order: send or confirm a bank transfer while
// it is unpaid, then record shipping progress once it is paid.
export function OrderAdminActions({ order }: { order: OrderDto }) {
  const queryClient = useQueryClient();
  const [shipStatus, setShipStatus] = useState<UpdateShippingRequest['status']>(OrderStatus.SHIPPED);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? '');

  const action = useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders-page'] });
    },
    onError: (error: any) => toast.error(parseApiError(error, 'Failed to update order').message),
  });

  const isBankTransfer = order.paymentMethod === PaymentMethod.BANK_TRANSFER && order.paymentId != null;
  const paymentId = order.paymentId as number;

  if (order.status === OrderStatus.PENDING_PAYMENT) {
    if (isBankTransfer && order.paymentStatus === PaymentStatus.INITIATED) {
      return (
        <button
          onClick={() => action.mutate(() => paymentsApi.sendBankInstructions(paymentId))}
          disabled={action.isPending}
          className="btn btn-outline text-sm mt-4 disabled:opacity-50"
        >
          Send Bank Transfer Instructions
        </button>
      );
    }
    if (
      isBankTransfer &&
      (order.paymentStatus === PaymentStatus.INSTRUCTIONS_SENT || order.paymentStatus === PaymentStatus.AWAITING_TRANSFER)
    ) {
      return (
        <button
          onClick={() => {
            if (window.confirm('Confirm the bank transfer has been received? This marks the order paid and the painting sold.')) {
              action.mutate(() => paymentsApi.confirmBankTransfer(paymentId));
            }
          }}
          disabled={action.isPending}
          className="btn btn-primary text-sm mt-4 disabled:opacity-50"
        >
          Confirm Transfer Received
        </button>
      );
    }
    return null;
  }

  if (
    order.status === OrderStatus.DELIVERED ||
    order.status === OrderStatus.CLOSED ||
    order.status === OrderStatus.REFUNDED ||
    order.status === OrderStatus.CANCELLED
  ) {
    return null;
  }

  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        action.mutate(() =>
          ordersApi.updateShipping(String(order.id), {
            status: shipStatus,
            trackingNumber: trackingNumber.trim() || undefined,
            trackingUrl: trackingUrl.trim() || undefined,
          })
        );
      }}
    >
      <select
        value={shipStatus}
        onChange={(e) => setShipStatus(e.target.value as UpdateShippingRequest['status'])}
        className="rounded-md border border-gray-300 p-2 text-sm"
      >
        {SHIPPING_STEPS.map((step) => (
          <option key={step} value={step}>
            {step.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
      <input
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking number"
        className="rounded-md border border-gray-300 p-2 text-sm"
      />
      <input
        type="url"
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        placeholder="Tracking URL (optional)"
        className="rounded-md border border-gray-300 p-2 text-sm"
      />
      <button type="submit" disabled={action.isPending} className="btn btn-primary text-sm disabled:opacity-50">
        Update Shipping
      </button>
    </form>
  );
}
