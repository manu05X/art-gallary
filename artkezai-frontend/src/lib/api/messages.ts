import apiClient from '@/lib/api';
import { ThreadDto, MessageDto, SendMessageRequest, PagedResponse } from '@/types';

export const messagesApi = {
  createThread: async (subject: string, paintingId?: string): Promise<ThreadDto> => {
    const response = await apiClient.post('/messages/threads', { subject, paintingId });
    return response;
  },

  getMyThreads: async (page: number = 1): Promise<PagedResponse<ThreadDto>> => {
    const response = await apiClient.get(`/messages/threads?page=${page}`);
    return response;
  },

  getThread: async (threadId: string): Promise<ThreadDto & { messages: MessageDto[] }> => {
    const response = await apiClient.get(`/messages/threads/${threadId}`);
    return response;
  },

  sendMessage: async (threadId: string, body: string): Promise<MessageDto> => {
    const response = await apiClient.post(`/messages/threads/${threadId}/messages`, {
      body,
    } as SendMessageRequest);
    return response;
  },
};
