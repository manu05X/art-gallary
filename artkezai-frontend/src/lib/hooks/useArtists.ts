'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api/artists';
import { UpdateArtistProfileRequest } from '@/types';
import { parseApiError } from '@/lib/api/utils';
import toast from 'react-hot-toast';

export const useArtists = (page: number = 1) => {
  return useQuery({
    queryKey: ['artists', page],
    queryFn: () => artistsApi.getArtists(page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useArtist = (slug?: string) => {
  return useQuery({
    queryKey: ['artist', slug],
    queryFn: () => artistsApi.getArtistBySlug(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyArtistProfile = () => {
  return useQuery({
    queryKey: ['my-artist-profile'],
    queryFn: () => artistsApi.getMyProfile(),
    staleTime: 0, // always fetch fresh when opening the profile page
  });
};

// Phase 2.12: the artist-scoped replacement for the dashboard's old direct
// call to ordersApi.getAllOrders (admin-wide, always 403'd for ARTIST).
export const useMyArtistOrders = (page: number = 1) => {
  return useQuery({
    queryKey: ['my-artist-orders', page],
    queryFn: () => artistsApi.getMyOrders(page),
    staleTime: 1000 * 60,
  });
};

// Invalidates the public artist directory and this artist's own public
// detail page (keyed by slug, which doesn't change) so neither shows stale
// data within the same session after a save — see Phase 2.11 report.
function invalidateArtistCaches(queryClient: ReturnType<typeof useQueryClient>, slug: string) {
  queryClient.invalidateQueries({ queryKey: ['my-artist-profile'] });
  queryClient.invalidateQueries({ queryKey: ['artists'] });
  queryClient.invalidateQueries({ queryKey: ['artist', slug] });
}

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: UpdateArtistProfileRequest) => artistsApi.updateMyProfile(req),
    onSuccess: (data) => {
      toast.success('Profile updated');
      invalidateArtistCaches(queryClient, data.slug);
    },
    onError: (error: any) => {
      toast.error(parseApiError(error, 'Failed to update profile').message);
    },
  });
};

export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => artistsApi.uploadProfilePhoto(file),
    onSuccess: (data) => {
      toast.success('Profile photo updated');
      invalidateArtistCaches(queryClient, data.slug);
    },
    onError: (error: any) => {
      toast.error(parseApiError(error, 'Failed to upload photo').message);
    },
  });
};
