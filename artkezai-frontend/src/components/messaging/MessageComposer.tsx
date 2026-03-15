'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useSendMessage } from '@/lib/hooks/useMessages';

interface MessageComposerProps {
  threadId: string;
}

export function MessageComposer({ threadId }: MessageComposerProps) {
  const [body, setBody] = useState('');
  const { mutate: sendMessage, isPending } = useSendMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    sendMessage(
      { threadId, body },
      {
        onSuccess: () => {
          setBody('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your message..."
        className="input resize-none flex-1"
        rows={3}
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !body.trim()}
        className="self-end px-4 py-2 bg-brand text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 flex items-center gap-2"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
