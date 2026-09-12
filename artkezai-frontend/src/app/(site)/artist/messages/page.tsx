'use client';

import { useState } from 'react';
import { useMyThreads, useThread } from '@/lib/hooks/useMessages';
import { MessageComposer } from '@/components/messaging/MessageComposer';
import { MessageSquare } from 'lucide-react';

export default function ArtistMessagesPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const { data: threadsData, isLoading: threadsLoading } = useMyThreads(1);

  const threads = threadsData?.data || [];
  const activeThreadId = selectedThreadId ?? threads[0]?.id ?? 0;
  const { data: selectedThread, isLoading: threadLoading } = useThread(activeThreadId);

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">No messages yet.</p>
        <p className="text-sm text-gray-500">Messages from buyers will appear here.</p>
      </div>
    );
  }

  const selected = threads.find((t) => t.id === activeThreadId) || threads[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-screen max-h-screen">
      <div className="bg-white rounded-lg shadow overflow-y-auto">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="font-semibold text-brand">Conversations</h2>
        </div>
        <div className="divide-y">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                selectedThreadId === thread.id ? 'bg-gray-100 border-l-4 border-accent' : ''
              }`}
            >
              <h3 className="font-semibold text-sm text-brand truncate">{thread.subject}</h3>
              <p className="text-xs text-gray-500 truncate mt-1">{thread.unreadCount} unread</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(thread.lastMessageAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="md:col-span-2 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-brand">{selected.subject}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {threadLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              </div>
            ) : selectedThread?.messages ? (
              selectedThread.messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-700">{message.senderName}</p>
                      <p className="text-sm text-gray-700 mt-1">{message.body}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          <div className="border-t border-gray-200 p-4">
            <MessageComposer threadId={selected.id} />
          </div>
        </div>
      )}
    </div>
  );
}
