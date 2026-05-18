'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paintingsApi } from '@/lib/api/paintings';
import { SubmitPaintingRequest, GalleryFilters } from '@/types';
import toast from 'react-hot-toast';

export const usePaintings = (filters: GalleryFilters, page: number = 1, sort: string = 'newest') => {
  return useQuery({
    queryKey: ['paintings', { filters, page, sort }],
    queryFn: () => paintingsApi.getGallery(filters, page, sort),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePainting = (slug: string) => {
  return useQuery({
    queryKey: ['painting', slug],
    queryFn: () => paintingsApi.getPaintingBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSubmitPainting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: SubmitPaintingRequest) => paintingsApi.submitPainting(req),
    onSuccess: () => {
      toast.success('Painting submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['paintings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit painting');
    },
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintingId, file }: { paintingId: string; file: File }) =>
      paintingsApi.uploadImage(paintingId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to upload image');
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => paintingsApi.getCategories(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useMediums = () => {
  return useQuery({
    queryKey: ['mediums'],
    queryFn: () => paintingsApi.getMediums(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => paintingsApi.getCountries(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useMyListings = (page: number = 1) => {
  return useQuery({
    queryKey: ['my-listings', page],
    queryFn: () => paintingsApi.getMyListings(page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdatePainting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paintingId, data }: { paintingId: string; data: Partial<SubmitPaintingRequest> }) =>
      paintingsApi.updatePainting(paintingId, data),
    onSuccess: () => {
      toast.success('Painting updated successfully');
      queryClient.invalidateQueries({ queryKey: ['paintings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update painting');
    },
  });
};
