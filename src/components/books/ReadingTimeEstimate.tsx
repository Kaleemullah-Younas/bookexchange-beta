'use client';

import { trpc } from '@/lib/trpc';

interface ReadingTimeEstimateProps {
  bookId: string;
}

export function ReadingTimeEstimate({ bookId }: ReadingTimeEstimateProps) {
  const { data, isLoading, error } = trpc.book.getReadingTimeEstimate.useQuery(
    { bookId },
    {
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
      retry: 1,
    }
  );

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-muted rounded" />
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail - don't show error for optional feature
  }

  const difficultyColors = {
    easy: 'bg-success/10 text-success border-success/20',
    moderate: 'bg-accent/10 text-accent border-accent/20',
    challenging: 'bg-warning/10 text-warning border-warning/20',
  };

  const difficultyLabels = {
    easy: 'Easy Read',
    moderate: 'Moderate',
    challenging: 'Challenging',
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              Reading Time Estimate
            </h3>
            <p className="text-xs text-muted-foreground">AI-powered estimate</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
            difficultyColors[data.difficulty]
          }`}
        >
          {difficultyLabels[data.difficulty]}
        </span>
      </div>

      {/* Time Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <p className="text-xl font-bold text-foreground">
            {data.estimatedHours < 1
              ? `${data.estimatedMinutes}m`
              : `${data.estimatedHours}h`}
          </p>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <p className="text-xl font-bold text-foreground">
            ~{data.pageEstimate}
          </p>
          <p className="text-xs text-muted-foreground">Pages</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <p className="text-xl font-bold text-foreground">
            {data.estimatedDays}
          </p>
          <p className="text-xs text-muted-foreground">Days*</p>
        </div>
      </div>

      {/* Pace Description */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-accent shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <p className="text-sm text-muted-foreground">{data.paceDescription}</p>
      </div>

      {/* Fun Fact */}
      <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 text-accent mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {data.funFact}
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-[10px] text-muted-foreground text-center mt-3">
        *Based on 2 hours of reading per day • Estimates may vary
      </p>
    </div>
  );
}
