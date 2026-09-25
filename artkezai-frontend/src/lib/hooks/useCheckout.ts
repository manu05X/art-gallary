'use client';

import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { CreateOrderRequest, OrderDto } from '@/types';

// Creates the order (Buy Now, or checkout of an accepted offer when offerId
// is set). Card payment happens afterwards on /dashboard/orders/[id]/pay.
export const useBuyNowCheckout = () => {
  return useMutation({
    mutationFn: (req: CreateOrderRequest): Promise<OrderDto> => ordersApi.createOrder(req),
  });
};
