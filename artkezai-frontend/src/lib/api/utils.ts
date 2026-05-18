import { PagedResponse } from '@/types';

export interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const parseApiError = (error: any, fallback: string) => {
  const apiMessage = error?.response?.data?.message;
  const fieldErrors = error?.response?.data?.errors;
  const validationMessage =
    fieldErrors && typeof fieldErrors === 'object' ? (Object.values(fieldErrors)[0] as string) : undefined;

  return {
    message: validationMessage || apiMessage || fallback,
    fieldErrors: fieldErrors && typeof fieldErrors === 'object' ? (fieldErrors as Record<string, string>) : {},
  };
};

export const toPagedResponse = <T>(pageData: SpringPage<T>): PagedResponse<T> => ({
  data: pageData.content,
  page: pageData.number + 1,
  pageSize: pageData.size,
  totalCount: pageData.totalElements,
  totalPages: pageData.totalPages,
  hasNextPage: !pageData.last,
  hasPreviousPage: !pageData.first,
});
