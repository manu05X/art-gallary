import apiClient from '@/lib/api';
import {
  PaintingListDto,
  PaintingDto,
  PaintingImageDto,
  SubmitPaintingRequest,
  GalleryFilters,
  Category,
  Medium,
  Country,
  PagedResponse,
} from '@/types';

export const paintingsApi = {
  getGallery: async (
    filters: GalleryFilters,
    page: number = 1,
    sort: string = 'newest'
  ): Promise<PagedResponse<PaintingListDto>> => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.mediumId) params.append('mediumId', filters.mediumId);
    if (filters.country) params.append('country', filters.country);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.orientation) params.append('orientation', filters.orientation);
    if (filters.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('sort', sort);

    const response = await apiClient.get<never, PagedResponse<PaintingListDto>>(`/paintings?${params.toString()}`);
    return response;
  },

  getPaintingBySlug: async (slug: string): Promise<PaintingDto> => {
    const response = await apiClient.get<never, PaintingDto>(`/paintings/slug/${slug}`);
    return response;
  },

  submitPainting: async (req: SubmitPaintingRequest): Promise<PaintingDto> => {
    const response = await apiClient.post<SubmitPaintingRequest, PaintingDto>('/paintings', req);
    return response;
  },

  uploadImage: async (paintingId: string, file: File): Promise<PaintingImageDto> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FormData, PaintingImageDto>(`/paintings/${paintingId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<never, Category[]>('/paintings/categories');
    return response;
  },

  getMediums: async (): Promise<Medium[]> => {
    const response = await apiClient.get<never, Medium[]>('/paintings/mediums');
    return response;
  },

  getCountries: async (): Promise<Country[]> => {
    const response = await apiClient.get<never, Country[]>('/paintings/countries');
    return response;
  },

  getMyListings: async (page: number = 1): Promise<PagedResponse<PaintingListDto>> => {
    const response = await apiClient.get<never, PagedResponse<PaintingListDto>>(`/paintings/my-listings?page=${page}`);
    return response;
  },

  updatePainting: async (paintingId: string, req: Partial<SubmitPaintingRequest>): Promise<PaintingDto> => {
    const response = await apiClient.patch<Partial<SubmitPaintingRequest>, PaintingDto>(`/paintings/${paintingId}`, req);
    return response;
  },
};
