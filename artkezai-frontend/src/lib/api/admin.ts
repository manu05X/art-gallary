import apiClient from '@/lib/api';
import { PaintingStatus } from '@/types';

// Mirrors the backend's PaintingListDto exactly (see PaintingListDto.java) —
// distinct from the frontend's shared PaintingListDto type, whose primaryImage
// field shape does not match what this endpoint actually returns.
export interface ModerationPainting {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  primaryImageUrl: string | null;
  thumbnailUrl: string | null;
  artistName: string;
  artistSlug: string;
  mediumName: string | null;
  categoryName: string | null;
  countryName: string | null;
  isOfferEnabled: boolean;
  status: PaintingStatus;
  createdAt: string;
}

// The backend returns a raw Spring Page (content/totalElements/...); this
// module unwraps it so callers only see a plain array.
interface SpringPage<T> {
  content: T[];
}

export const adminApi = {
  getModerationQueue: async (): Promise<ModerationPainting[]> => {
    const response = await apiClient.get<never, SpringPage<ModerationPainting>>('/admin/moderation/queue');
    return response.content;
  },

  approvePainting: async (paintingId: string): Promise<void> => {
    await apiClient.post<never, void>(`/admin/moderation/${paintingId}/approve`);
  },

  rejectPainting: async (paintingId: string, reason: string): Promise<void> => {
    await apiClient.post<{ reason: string }, void>(`/admin/moderation/${paintingId}/reject`, { reason });
  },
};
