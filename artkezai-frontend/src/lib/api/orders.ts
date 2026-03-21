import apiClient from '@/lib/api';
import { OrderDto, CreateOrderRequest, UpdateShippingRequest, PagedResponse } from '@/types';

const toPagedResponse = <T>(pageData: any): PagedResponse<T> => ({
  data: pageData?.content || [],
  page: (pageData?.number ?? 0) + 1,
  pageSize: pageData?.size ?? 0,
  totalCount: pageData?.totalElements ?? 0,
  totalPages: pageData?.totalPages ?? 0,
  hasNextPage: !(pageData?.last ?? true),
  hasPreviousPage: !(pageData?.first ?? true),
});

export const ordersApi = {
  createOrder: async (req: CreateOrderRequest): Promise<OrderDto> => {
    const response = await apiClient.post('/orders', req);
    return response;
  },

  getMyOrders: async (page: number = 1): Promise<PagedResponse<OrderDto>> => {
    const response = await apiClient.get(`/orders/my?page=${Math.max(page - 1, 0)}`);
    return toPagedResponse<OrderDto>(response);
  },

  getAllOrders: async (page: number = 1): Promise<PagedResponse<OrderDto>> => {
    const response = await apiClient.get(`/orders?page=${Math.max(page - 1, 0)}`);
    return toPagedResponse<OrderDto>(response);
  },

  updateShipping: async (orderId: string, req: UpdateShippingRequest): Promise<OrderDto> => {
    const response = await apiClient.patch(`/orders/${orderId}/shipping`, req);
    return response;
  },

  getOrder: async (orderId: string): Promise<OrderDto> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response;
  },
};
