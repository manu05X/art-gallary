import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';

// Reads the `exp` claim (seconds) from a JWT without verifying it; the
// server does the verification. Returns milliseconds, or null if unreadable.
export function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Logs out on the server first (revoking the token everywhere), then clears
// local state. Local sign-out still happens if the server call fails.
export async function signOut(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // Token may already be expired or revoked; nothing else to do.
  }
  useAuthStore.getState().logout();
}
