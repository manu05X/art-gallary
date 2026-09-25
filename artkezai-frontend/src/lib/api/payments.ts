import apiClient from '@/lib/api';
import { CreatePaymentIntentRequest, PaymentIntentResponse, PaymentStatus } from '@/types';

export const paymentsApi = {
  createPaymentIntent: async (req: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post<CreatePaymentIntentRequest, PaymentIntentResponse>('/payments/intent', req);
    return response;
  },

  sendBankInstructions: async (paymentId: number): Promise<void> => {
    await apiClient.post(`/payments/${paymentId}/bank-instructions`);
  },

  confirmBankTransfer: async (paymentId: number): Promise<void> => {
    await apiClient.post(`/payments/${paymentId}/bank-confirm`);
  },

  // Asks the backend to check the order's PaymentIntent with Stripe, so the
  // order reaches PAID even if the webhook has not arrived yet.
  syncPayment: async (orderId: number): Promise<PaymentStatus> => {
    const response = await apiClient.post<never, PaymentStatus>(`/payments/orders/${orderId}/sync`);
    return response;
  },
};
