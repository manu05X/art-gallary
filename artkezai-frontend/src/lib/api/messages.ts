import apiClient from '@/lib/api';
import { ThreadDto, MessageDto, SendMessageRequest, PagedResponse } from '@/types';
import { SpringPage, toPagedResponse } from '@/lib/api/utils';

export const messagesApi = {
  createThread: async (subject: string, body: string, paintingId?: number): Promise<ThreadDto> => {
    const response = await apiClient.post<{ subject: string; body: string; paintingId?: number }, ThreadDto>(
      '/messages/threads',
      { subject, body, paintingId }
    );
    return response;
  },

  getMyThreads: async (page: number = 1): Promise<PagedResponse<ThreadDto>> => {
    const response = await apiClient.get<never, SpringPage<ThreadDto>>(
      `/messages/threads?page=${Math.max(page - 1, 0)}`
    );
    return toPagedResponse<ThreadDto>(response);
  },

  getThread: async (threadId: number): Promise<ThreadDto & { messages: MessageDto[] }> => {
    const response = await apiClient.get<never, ThreadDto & { messages: MessageDto[] }>(`/messages/threads/${threadId}`);
    return response;
  },

  sendMessage: async (threadId: number, body: string): Promise<MessageDto> => {
    const response = await apiClient.post<SendMessageRequest, MessageDto>(`/messages/threads/${threadId}/messages`, {
      body,
    } as SendMessageRequest);
    return response;
  },
};
