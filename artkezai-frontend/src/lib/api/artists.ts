import apiClient from '@/lib/api';
import { ArtistSummary, ArtistDetail, PagedResponse } from '@/types';

export const artistsApi = {
  // GET /api/artists only ever returns isVerified=true profiles (existing
  // backend business rule, unchanged here) — see Phase 2.9 report for what
  // that means for the current dataset.
  getArtists: async (page: number = 1): Promise<PagedResponse<ArtistSummary>> => {
    const response = await apiClient.get<never, PagedResponse<ArtistSummary>>(
      `/artists?page=${Math.max(page - 1, 0)}`
    );
    return response;
  },

  getArtistBySlug: async (slug: string): Promise<ArtistDetail> => {
    const response = await apiClient.get<never, ArtistDetail>(`/artists/${slug}`);
    return response;
  },
};
