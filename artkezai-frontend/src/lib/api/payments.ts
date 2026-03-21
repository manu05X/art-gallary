import apiClient from '@/lib/api';
import { CreatePaymentIntentRequest, PaymentIntentResponse } from '@/types';

export const paymentsApi = {
  createPaymentIntent: async (req: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post('/payments/intent', req);
    return response;
  },
};
