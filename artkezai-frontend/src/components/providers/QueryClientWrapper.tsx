'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function QueryClientWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1710',
            color: '#F5F0E8',
            border: '1px solid #2E2A22',
            borderRadius: '0',
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#0F0F0F' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0F0F0F' } },
        }}
      />
    </QueryClientProvider>
  );
}
