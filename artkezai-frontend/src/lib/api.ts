import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '@/lib/store/authStore';
import { ApiResponse } from '@/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    if (response.data?.data !== undefined) {
      return Promise.resolve(response.data.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
