import apiClient from '@/lib/api';
import { OfferDto, MakeOfferRequest, RespondOfferRequest, PagedResponse } from '@/types';
import { SpringPage, toPagedResponse } from '@/lib/api/utils';

export const offersApi = {
  makeOffer: async (req: MakeOfferRequest): Promise<OfferDto> => {
    const response = await apiClient.post<MakeOfferRequest, OfferDto>('/offers', req);
    return response;
  },

  getMyOffers: async (page: number = 1): Promise<PagedResponse<OfferDto>> => {
    const response = await apiClient.get<never, SpringPage<OfferDto>>(`/offers/my?page=${Math.max(page - 1, 0)}`);
    return toPagedResponse<OfferDto>(response);
  },

  getArtistOffers: async (page: number = 1): Promise<PagedResponse<OfferDto>> => {
    const response = await apiClient.get<never, SpringPage<OfferDto>>(
      `/offers/received?page=${Math.max(page - 1, 0)}`
    );
    return toPagedResponse<OfferDto>(response);
  },

  respondToOffer: async (offerId: number, req: RespondOfferRequest): Promise<OfferDto> => {
    const response = await apiClient.post<RespondOfferRequest, OfferDto>(`/offers/${offerId}/respond`, req);
    return response;
  },

  withdrawOffer: async (offerId: number): Promise<void> => {
    await apiClient.post(`/offers/${offerId}/withdraw`);
  },

  getAllOffers: async (page: number = 1): Promise<PagedResponse<OfferDto>> => {
    const response = await apiClient.get<never, SpringPage<OfferDto>>(`/offers?page=${Math.max(page - 1, 0)}`);
    return toPagedResponse<OfferDto>(response);
  },
};
