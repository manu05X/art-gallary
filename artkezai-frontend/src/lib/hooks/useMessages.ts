'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api/messages';
import { ThreadDto, MessageDto } from '@/types';
import toast from 'react-hot-toast';

export const useMyThreads = (page: number = 1) => {
  return useQuery({
    queryKey: ['my-threads', page],
    queryFn: () => messagesApi.getMyThreads(page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useThread = (threadId: string) => {
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
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) =>
      messagesApi.sendMessage(threadId, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['thread'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send message');
    },
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subject, paintingId }: { subject: string; paintingId?: string }) =>
      messagesApi.createThread(subject, paintingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-threads'] });
      toast.success('Thread created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create thread');
    },
  });
};
