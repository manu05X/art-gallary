import apiClient from '@/lib/api';

export interface ContentPage {
  slug: string;
  title: string;
  body: string;
  isPublished: boolean;
  updatedAt: string;
}

export const contentApi = {
  getPage: async (slug: string): Promise<ContentPage> => {
    const response = await apiClient.get<never, ContentPage>(`/content/${encodeURIComponent(slug)}`);
    return response;
  },
};
