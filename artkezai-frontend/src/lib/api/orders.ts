import apiClient from '@/lib/api';
import { OrderDto, CreateOrderRequest, UpdateShippingRequest, PagedResponse } from '@/types';
import { SpringPage, toPagedResponse } from '@/lib/api/utils';

export const ordersApi = {
  createOrder: async (req: CreateOrderRequest): Promise<OrderDto> => {
    const response = await apiClient.post<CreateOrderRequest, OrderDto>('/orders', req);
    return response;
  },

  getMyOrders: async (page: number = 1): Promise<PagedResponse<OrderDto>> => {
    const response = await apiClient.get<never, SpringPage<OrderDto>>(`/orders/my?page=${Math.max(page - 1, 0)}`);
    return toPagedResponse<OrderDto>(response);
  },

  getAllOrders: async (page: number = 1): Promise<PagedResponse<OrderDto>> => {
    const response = await apiClient.get<never, SpringPage<OrderDto>>(`/orders?page=${Math.max(page - 1, 0)}`);
    return toPagedResponse<OrderDto>(response);
  },

  updateShipping: async (orderId: string, req: UpdateShippingRequest): Promise<OrderDto> => {
    const response = await apiClient.patch<UpdateShippingRequest, OrderDto>(`/orders/${orderId}/shipping`, req);
    return response;
  },

  getOrder: async (orderId: string): Promise<OrderDto> => {
    const response = await apiClient.get<never, OrderDto>(`/orders/${orderId}`);
    return response;
  },
};
