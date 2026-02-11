'use client';

import { trpc } from '@/lib/trpc';

interface PointsDisplayProps {
  compact?: boolean;
}

export function PointsDisplay({ compact = false }: PointsDisplayProps) {
  const { data, isLoading } = trpc.exchange.getUserPoints.useQuery();

  if (isLoading) {
    return (
      <div
        className={`animate-pulse ${
          compact ? 'h-6 w-16' : 'h-10 w-24'
        } rounded-lg bg-muted`}
      />
    );
  }

  if (!data) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
        <svg
          className="w-4 h-4 text-accent"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
        </svg>
        <span className="text-sm font-semibold text-accent">
          {data.currentPoints.toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20">
        <svg
          className="w-5 h-5 text-accent"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
        </svg>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Your Points</p>
        <p className="text-lg font-bold text-accent">
          {data.currentPoints.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export function PointsStats() {
  const { data, isLoading } = trpc.exchange.getUserPoints.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse h-24 rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Current Balance',
      value: data.currentPoints,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
        </svg>
      ),
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Total Earned',
      value: data.totalEarned,
      icon: (
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Total Spent',
      value: data.totalSpent,
      icon: (
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
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      ),
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
