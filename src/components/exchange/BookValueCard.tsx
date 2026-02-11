'use client';

import { trpc } from '@/lib/trpc';

interface BookValueCardProps {
  bookId: string;
  showBreakdown?: boolean;
}

export function BookValueCard({
  bookId,
  showBreakdown = false,
}: BookValueCardProps) {
  const { data, isLoading, error } = trpc.exchange.getBookValue.useQuery(
    { bookId },
    { enabled: !!bookId }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { points, breakdown } = data;

  return (
    <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
      {/* Main Value Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/20">
            <svg
              className="w-5 h-5 text-accent"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Exchange Value</p>
            <p className="text-xl font-bold text-accent">{points} points</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
          </svg>
          AI Calculated
        </div>
      </div>

      {/* Breakdown Section */}
      {showBreakdown && breakdown && (
        <div className="mt-4 pt-4 border-t border-accent/10">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Value Breakdown
          </p>
          <div className="space-y-2">
            {/* Base Value */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base Value</span>
              <span className="font-medium">{breakdown.basePoints} pts</span>
            </div>

            {/* Condition Factor */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Condition</span>
                <span className="px-1.5 py-0.5 rounded text-xs bg-secondary text-foreground">
                  {breakdown.conditionLabel.replace('_', ' ')}
                </span>
              </div>
              <span
                className={`font-medium ${
                  breakdown.conditionMultiplier > 1
                    ? 'text-success'
                    : breakdown.conditionMultiplier < 1
                    ? 'text-warning'
                    : ''
                }`}
              >
                ×{breakdown.conditionMultiplier.toFixed(2)}
              </span>
            </div>

            {/* Rarity Factor */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Rarity</span>
                <span className="text-xs text-muted-foreground">
                  ({breakdown.copiesInSystem}{' '}
                  {breakdown.copiesInSystem === 1 ? 'copy' : 'copies'}{' '}
                  available)
                </span>
              </div>
              <span
                className={`font-medium ${
                  breakdown.rarityMultiplier > 1 ? 'text-success' : ''
                }`}
              >
                ×{breakdown.rarityMultiplier.toFixed(2)}
              </span>
            </div>

            {/* Demand Factor */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Demand</span>
                <span className="text-xs text-muted-foreground">
                  ({breakdown.pendingRequests}{' '}
                  {breakdown.pendingRequests === 1 ? 'request' : 'requests'})
                </span>
              </div>
              <span
                className={`font-medium ${
                  breakdown.demandMultiplier > 1 ? 'text-success' : ''
                }`}
              >
                ×{breakdown.demandMultiplier.toFixed(2)}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-accent/20 my-2" />

            {/* Final Value */}
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-foreground">Final Value</span>
              <span className="text-accent">
                {breakdown.finalPoints} points
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for cards
export function BookValueBadge({ bookId }: { bookId: string }) {
  const { data, isLoading } = trpc.exchange.getBookValue.useQuery(
    { bookId },
    { enabled: !!bookId }
  );

  if (isLoading) {
    return <div className="animate-pulse h-6 w-16 rounded-full bg-muted" />;
  }

  if (!data) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 border border-accent/20">
      <svg
        className="w-3.5 h-3.5 text-accent"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
      </svg>
      <span className="text-sm font-semibold text-accent">{data.points}</span>
    </div>
  );
}
