import apiClient from '@/lib/api';
import { OrderDto, CreateOrderRequest, UpdateShippingRequest, PagedResponse } from '@/types';

export const ordersApi = {
  createOrder: async (req: CreateOrderRequest): Promise<OrderDto> => {
    const response = await apiClient.post('/orders', req);
    return response;
  },

  getMyOrders: async (page: number = 1): Promise<PagedResponse<OrderDto>> => {
    const response = await apiClient.get(`/orders/my-orders?page=${page}`);
    return response;
  },

  getAllOrders: async (page: number = 1): Promise<PagedResponse<OrderDto>> => {
    const response = await apiClient.get(`/admin/orders?page=${page}`);
    return response;
  },

  updateShipping: async (orderId: string, req: UpdateShippingRequest): Promise<OrderDto> => {
    const response = await apiClient.patch(`/admin/orders/${orderId}/shipping`, req);
    return response;
  },

  getOrder: async (orderId: string): Promise<OrderDto> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response;
  },
};
