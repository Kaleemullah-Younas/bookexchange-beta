'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

interface ReplyFormProps {
  discussionId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function ReplyForm({
  discussionId,
  parentId,
  onSuccess,
  onCancel,
  placeholder,
}: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const createReply = trpc.forum.createReply.useMutation({
    onSuccess: () => {
      utils.forum.getDiscussionById.invalidate({ id: discussionId });
      setContent('');
      setIsAnonymous(false);
      setError('');
      onSuccess?.();
    },
    onError: err => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (content.length < 5) {
      setError('Reply must be at least 5 characters');
      return;
    }

    createReply.mutate({
      discussionId,
      content,
      isAnonymous,
      parentId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder || 'Share your thoughts...'}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-card-foreground placeholder:text-muted-foreground resize-none"
          required
        />
        <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {content.length}/5000
        </span>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
              isAnonymous
                ? 'bg-accent border-accent'
                : 'border-border group-hover:border-accent/50'
            }`}
          >
            {isAnonymous && (
              <svg
                className="w-3 h-3 text-accent-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="text-sm text-muted-foreground group-hover:text-card-foreground transition-colors">
            Reply anonymously
          </span>
        </label>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-card-foreground hover:bg-secondary transition-all duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createReply.isPending || content.length < 5}
            className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createReply.isPending ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Posting...
              </>
            ) : (
              'Post Reply'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
