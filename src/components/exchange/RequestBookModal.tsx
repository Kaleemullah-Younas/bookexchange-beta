'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { BookValueCard } from './BookValueCard';

interface RequestBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author: string;
    images: string[];
    condition: string;
    owner: {
      name: string;
    };
  };
}

export function RequestBookModal({
  isOpen,
  onClose,
  book,
}: RequestBookModalProps) {
  const [message, setMessage] = useState('');
  const utils = trpc.useUtils();

  const { data: userPoints } = trpc.exchange.getUserPoints.useQuery();
  const { data: bookValue } = trpc.exchange.getBookValue.useQuery({
    bookId: book.id,
  });

  const requestBook = trpc.exchange.requestBook.useMutation({
    onSuccess: () => {
      utils.exchange.getUserPoints.invalidate();
      utils.exchange.getOutgoingRequests.invalidate();
      onClose();
    },
  });

  if (!isOpen) return null;

  const hasEnoughPoints =
    (userPoints?.currentPoints ?? 0) >= (bookValue?.points ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-border bg-card z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Request Book
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Send a request to the owner
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Book Preview */}
          <div className="flex gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {book.images[0] && (
                <img
                  src={book.images[0]}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {book.author}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Owner: {book.owner.name}
              </p>
            </div>
          </div>

          {/* Book Value */}
          <BookValueCard bookId={book.id} showBreakdown />

          {/* Your Points */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-xl font-bold text-foreground">
                {userPoints?.currentPoints.toLocaleString() ?? 0} points
              </p>
            </div>
            {bookValue && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">After Request</p>
                <p
                  className={`text-xl font-bold ${
                    hasEnoughPoints ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {(
                    (userPoints?.currentPoints ?? 0) - bookValue.points
                  ).toLocaleString()}{' '}
                  points
                </p>
              </div>
            )}
          </div>

          {/* Not enough points warning */}
          {!hasEnoughPoints && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-medium">Insufficient Points</p>
                <p className="text-sm opacity-80">
                  You need{' '}
                  {(bookValue?.points ?? 0) - (userPoints?.currentPoints ?? 0)}{' '}
                  more points to request this book.
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Message to Owner (Optional)
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Introduce yourself or explain why you'd like this book..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length}/500
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/20">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary/50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                requestBook.mutate({
                  bookId: book.id,
                  message: message || undefined,
                })
              }
              disabled={!hasEnoughPoints || requestBook.isPending}
              className="flex-1 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {requestBook.isPending ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
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
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Request Book
                </>
              )}
            </button>
          </div>

          {requestBook.isError && (
            <p className="text-sm text-destructive text-center mt-3">
              {requestBook.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
