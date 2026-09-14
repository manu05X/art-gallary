'use client';

import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api/artists';

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
