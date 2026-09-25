'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';

interface LiveNotification {
  type: string;
  message: string;
  link?: string;
}

// ws(s)://host/ws, derived from the REST base URL (http(s)://host/api).
function socketUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  return api.replace(/\/api\/?$/, '/ws').replace(/^http/, 'ws');
}

// Receives live notifications (offer answered, order paid, new message, …)
// while the user is signed in, shows them as toasts and refreshes on-screen
// data. Email remains the durable channel when the user is offline.
export default function LiveNotifications() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const onNotification = (body: string) => {
      let note: LiveNotification;
      try {
        note = JSON.parse(body);
      } catch {
        return;
      }
      queryClient.invalidateQueries();
      toast(
        (t) => (
          <button
            type="button"
            className="text-left"
            onClick={() => {
              toast.dismiss(t.id);
              if (note.link) router.push(note.link);
            }}
          >
            {note.message}
          </button>
        ),
        { duration: 6000 }
      );
    };

    const client = new Client({
      brokerURL: socketUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 10000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (m) => onNotification(m.body));
        if (role === 'admin') {
          client.subscribe('/topic/admin', (m) => onNotification(m.body));
        }
      },
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [token, role, queryClient, router]);

  return null;
}
