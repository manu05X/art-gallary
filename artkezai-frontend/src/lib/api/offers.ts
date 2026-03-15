import apiClient from '@/lib/api';
import { OfferDto, MakeOfferRequest, RespondOfferRequest, PagedResponse } from '@/types';

export const offersApi = {
  makeOffer: async (req: MakeOfferRequest): Promise<OfferDto> => {
    const response = await apiClient.post('/offers', req);
    return response;
  },

  getMyOffers: async (page: number = 1): Promise<PagedResponse<OfferDto>> => {
    const response = await apiClient.get(`/offers/my-offers?page=${page}`);
    return response;
  },

  respondToOffer: async (offerId: string, req: RespondOfferRequest): Promise<OfferDto> => {
    const response = await apiClient.patch(`/admin/offers/${offerId}`, req);
    return response;
  },

  withdrawOffer: async (offerId: string): Promise<void> => {
    await apiClient.patch(`/offers/${offerId}/withdraw`);
  },

  getAllOffers: async (page: number = 1): Promise<PagedResponse<OfferDto>> => {
    const response = await apiClient.get(`/admin/offers?page=${page}`);
    return response;
  },
};
