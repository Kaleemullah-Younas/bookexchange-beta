'use client';

import { ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

const TRANSACTION_ICONS: Record<string, ReactNode> = {
  EARNED_LISTING: (
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
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  EARNED_EXCHANGE: (
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
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  ),
  SPENT_REQUEST: (
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
  ),
  REFUND: (
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
        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
      />
    </svg>
  ),
  BONUS: (
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
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const TRANSACTION_COLORS: Record<string, { bg: string; text: string }> = {
  EARNED_LISTING: { bg: 'bg-success/10', text: 'text-success' },
  EARNED_EXCHANGE: { bg: 'bg-success/10', text: 'text-success' },
  SPENT_REQUEST: { bg: 'bg-warning/10', text: 'text-warning' },
  REFUND: { bg: 'bg-accent/10', text: 'text-accent' },
  BONUS: { bg: 'bg-accent/10', text: 'text-accent' },
};

const TRANSACTION_LABELS: Record<string, string> = {
  EARNED_LISTING: 'Listing Bonus',
  EARNED_EXCHANGE: 'Book Exchange',
  SPENT_REQUEST: 'Book Request',
  REFUND: 'Refund',
  BONUS: 'Bonus',
};

export function TransactionHistory() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.exchange.getTransactionHistory.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: lastPage => lastPage.nextCursor }
    );

  const transactions = data?.pages.flatMap(page => page.transactions) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-20 rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No Transactions Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Start by listing a book to earn your first points!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => {
        const colors = TRANSACTION_COLORS[transaction.type] || {
          bg: 'bg-muted',
          text: 'text-foreground',
        };
        const icon = TRANSACTION_ICONS[transaction.type];
        const label = TRANSACTION_LABELS[transaction.type] || transaction.type;
        const isPositive = transaction.amount > 0;

        return (
          <div
            key={transaction.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-colors"
          >
            {/* Icon */}
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
              {icon}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                >
                  {label}
                </span>
              </div>
              <p className="text-sm text-foreground truncate">
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Amount */}
            <div
              className={`text-right ${
                isPositive ? 'text-success' : 'text-warning'
              }`}
            >
              <p className="text-lg font-bold">
                {isPositive ? '+' : ''}
                {transaction.amount.toLocaleString()}
              </p>
              <p className="text-xs opacity-70">points</p>
            </div>
          </div>
        );
      })}

      {/* Load More */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary/50 transition-all duration-200 disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
