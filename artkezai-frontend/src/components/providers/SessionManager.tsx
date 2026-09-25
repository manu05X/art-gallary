'use client';

import { useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { tokenExpiry } from '@/lib/auth/session';
import { useAuthStore } from '@/lib/store/authStore';

const CHECK_EVERY_MS = 5 * 60 * 1000;
const REFRESH_WITHIN_MS = 60 * 60 * 1000;

// Keeps an active session alive: when the token is within an hour of
// expiring, swaps it for a fresh one. An already-expired token is left to the
// API client's 401 handling, which signs the user out.
export default function SessionManager() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const maybeRefresh = async () => {
      const expiresAt = tokenExpiry(token);
      if (!expiresAt) return;
      const remaining = expiresAt - Date.now();
      if (remaining > 0 && remaining < REFRESH_WITHIN_MS) {
        try {
          useAuthStore.getState().setToken(await authApi.refresh());
        } catch {
          // The 401 interceptor handles a rejected token.
        }
      }
    };

    maybeRefresh();
    const timer = setInterval(maybeRefresh, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [token]);

  return null;
}
