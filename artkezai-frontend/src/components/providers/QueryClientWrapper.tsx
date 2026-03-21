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
            background: 'var(--color-surface)',
            color: 'var(--color-cream)',
            border: '1px solid var(--color-border)',
            borderRadius: '0',
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: 'var(--color-gold)', secondary: 'var(--color-dark)' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'var(--color-dark)' } },
        }}
      />
    </QueryClientProvider>
  );
}
