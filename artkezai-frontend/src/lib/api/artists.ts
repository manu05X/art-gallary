import apiClient from '@/lib/api';
import { ArtistSummary, ArtistDetail, UpdateArtistProfileRequest, PagedResponse } from '@/types';

export const artistsApi = {
  // GET /api/artists returns artists with >= 1 APPROVED painting (Phase
  // 2.10) — independent of isVerified, which has no admin workflow behind it.
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

  getMyProfile: async (): Promise<ArtistDetail> => {
    const response = await apiClient.get<never, ArtistDetail>('/artists/me');
    return response;
  },

  // Partial update — every field optional; the backend applies only what's
  // sent (Phase 2.11 fix — the previous PUT overwrote every field, including
  // the NOT NULL displayName, with whatever was omitted).
  updateMyProfile: async (req: UpdateArtistProfileRequest): Promise<ArtistDetail> => {
    const response = await apiClient.put<UpdateArtistProfileRequest, ArtistDetail>('/artists/me', req);
    return response;
  },

  uploadProfilePhoto: async (file: File): Promise<ArtistDetail> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FormData, ArtistDetail>('/artists/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};
