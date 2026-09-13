import apiClient from '@/lib/api';
import {
  PaintingListDto,
  PaintingDto,
  PaintingCreateResponse,
  PaintingImageDto,
  SubmitPaintingRequest,
  GalleryFilters,
  Category,
  Medium,
  Country,
  PagedResponse,
} from '@/types';

export const paintingsApi = {
  // Frontend callers use 1-based page numbers and their own filter/sort naming
  // (search, country, sort); this is the one place that translates both to what
  // the backend actually expects (keyword, countryId, sortBy, 0-based page).
  getGallery: async (
    filters: GalleryFilters,
    page: number = 1,
    sort: string = 'newest'
  ): Promise<PagedResponse<PaintingListDto>> => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.mediumId) params.append('mediumId', filters.mediumId);
    if (filters.country) params.append('countryId', filters.country);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.orientation) params.append('orientation', filters.orientation);
    if (filters.search) params.append('keyword', filters.search);
    params.append('page', Math.max(page - 1, 0).toString());
    params.append('sortBy', sort);

    const response = await apiClient.get<never, PagedResponse<PaintingListDto>>(`/paintings?${params.toString()}`);
    return response;
  },

  getPaintingBySlug: async (slug: string): Promise<PaintingDto> => {
    const response = await apiClient.get<never, PaintingDto>(`/paintings/slug/${slug}`);
    return response;
  },

  // GET /api/paintings/{id} has no ownership/status restriction on the backend
  // (same endpoint the public detail page would hit by numeric id) — used here
  // to prefill the edit form. The actual edit is only ever enforced by the
  // backend's ownership check on PATCH.
  getPaintingById: async (paintingId: string): Promise<PaintingDto> => {
    const response = await apiClient.get<never, PaintingDto>(`/paintings/${paintingId}`);
    return response;
  },

  submitPainting: async (req: SubmitPaintingRequest): Promise<PaintingCreateResponse> => {
    const response = await apiClient.post<SubmitPaintingRequest, PaintingCreateResponse>('/paintings', req);
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

  // Partial update — every field optional; the backend applies only what's sent
  // and returns the same minimal confirmation shape as create/submit-for-review.
  updatePainting: async (paintingId: string, req: Partial<SubmitPaintingRequest>): Promise<PaintingCreateResponse> => {
    const response = await apiClient.patch<Partial<SubmitPaintingRequest>, PaintingCreateResponse>(`/paintings/${paintingId}`, req);
    return response;
  },

  submitForReview: async (paintingId: string): Promise<PaintingCreateResponse> => {
    const response = await apiClient.post<never, PaintingCreateResponse>(`/paintings/${paintingId}/submit`);
    return response;
  },
};
