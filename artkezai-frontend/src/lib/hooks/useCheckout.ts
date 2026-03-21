'use client';

import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { paymentsApi } from '@/lib/api/payments';
import { CreateOrderRequest, OrderDto, PaymentMethod, PaymentIntentResponse } from '@/types';

export interface BuyNowResult {
  order: OrderDto;
  paymentIntent?: PaymentIntentResponse;
}

export const useBuyNowCheckout = () => {
  return useMutation({
    mutationFn: async (req: CreateOrderRequest): Promise<BuyNowResult> => {
      const order = await ordersApi.createOrder(req);

      if (req.paymentMethod === PaymentMethod.ONLINE) {
        const paymentIntent = await paymentsApi.createPaymentIntent({ orderId: order.id });
        return { order, paymentIntent };
      }

      return { order };
    },
  });
};
