'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api/messages';
import { parseApiError } from '@/lib/api/utils';
import toast from 'react-hot-toast';

export const useMyThreads = (page: number = 1) => {
  return useQuery({
    queryKey: ['my-threads', page],
    queryFn: () => messagesApi.getMyThreads(page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useThread = (threadId: number) => {
  return useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => messagesApi.getThread(threadId),
    enabled: !!threadId,
    staleTime: 1000 * 30,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: number; body: string }) =>
      messagesApi.sendMessage(threadId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread'] });
    },
    onError: (error: any) => {
      toast.error(parseApiError(error, 'Failed to send message').message);
    },
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subject, body, paintingId }: { subject: string; body: string; paintingId?: number }) =>
      messagesApi.createThread(subject, body, paintingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-threads'] });
      toast.success('Thread created');
    },
    onError: (error: any) => {
      toast.error(parseApiError(error, 'Failed to create thread').message);
    },
  });
};
