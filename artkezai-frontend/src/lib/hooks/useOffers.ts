'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '@/lib/api/offers';
import { OfferDto, MakeOfferRequest, RespondOfferRequest } from '@/types';
import toast from 'react-hot-toast';

export const useMyOffers = (page: number = 1) => {
  return useQuery({
    queryKey: ['my-offers', page],
    queryFn: () => offersApi.getMyOffers(page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMakeOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: MakeOfferRequest) => offersApi.makeOffer(req),
    onSuccess: (data) => {
      toast.success(`Offer of $${data.buyerAmount} submitted!`);
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to make offer');
    },
  });
};

export const useRespondToOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, req }: { offerId: string; req: RespondOfferRequest }) =>
      offersApi.respondToOffer(offerId, req),
    onSuccess: (data) => {
      toast.success(`Offer ${data.status.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to respond to offer');
    },
  });
};

export const useWithdrawOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => offersApi.withdrawOffer(offerId),
    onSuccess: () => {
      toast.success('Offer withdrawn');
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to withdraw offer');
    },
  });
};

export const useAllOffers = (page: number = 1) => {
  return useQuery({
    queryKey: ['all-offers', page],
    queryFn: () => offersApi.getAllOffers(page),
    staleTime: 1000 * 60 * 5,
  });
};
