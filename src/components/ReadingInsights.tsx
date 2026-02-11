'use client';

import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export function ReadingInsights() {
  const [showFullInsights, setShowFullInsights] = useState(false);

  const {
    data: insightsData,
    isLoading,
    error,
    refetch,
  } = trpc.readingInsights.getInsights.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return <ReadingInsightsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load reading insights</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { insights, historyCount } = insightsData!;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-accent/10 via-accent/5 to-transparent p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                AI Reading Insights
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on {historyCount} {historyCount === 1 ? 'book' : 'books'}{' '}
                in your history
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            AI Powered
          </span>
        </div>
      </div>

      {/* Personality Type Banner */}
      <div className="px-6 py-4 bg-accent/5 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {insights.personalityType.split(' ').pop()}
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Your Reader Type</p>
            <p className="font-semibold text-foreground">
              {insights.personalityType.replace(
                /\s*[\u{1F300}-\u{1F9FF}]/gu,
                ''
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b border-border">
        <p className="text-foreground leading-relaxed">{insights.summary}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
        <div className="p-4 border-r border-b sm:border-b-0 border-border text-center">
          <p className="text-2xl font-bold text-accent">
            {insights.totalBooksRead}
          </p>
          <p className="text-xs text-muted-foreground">Books Read</p>
        </div>
        <div className="p-4 border-b sm:border-b-0 sm:border-r border-border text-center">
          <p className="text-2xl font-bold text-foreground">
            {insights.averageRating ? `${insights.averageRating}★` : '—'}
          </p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </div>
        <div className="p-4 border-r border-border text-center">
          <p className="text-2xl font-bold text-foreground">
            {insights.favoriteGenres.length || '—'}
          </p>
          <p className="text-xs text-muted-foreground">Genres</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-lg font-bold text-foreground truncate">
            {insights.mostActiveMonth || '—'}
          </p>
          <p className="text-xs text-muted-foreground">Most Active</p>
        </div>
      </div>

      {/* Expandable Details */}
      {showFullInsights && (
        <div className="divide-y divide-border">
          {/* Favorite Genres */}
          {insights.favoriteGenres.length > 0 && (
            <div className="p-6">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Favorite Genres
              </h4>
              <div className="flex flex-wrap gap-2">
                {insights.favoriteGenres.map((genre, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reading Pace & Geography */}
          <div className="p-6 grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent"
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
                Reading Pace
              </h4>
              <p className="text-muted-foreground text-sm">
                {insights.readingPace}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Geographic Diversity
              </h4>
              <p className="text-muted-foreground text-sm">
                {insights.geographicDiversity}
              </p>
            </div>
          </div>

          {/* Fun Facts */}
          {insights.funFacts.length > 0 && (
            <div className="p-6">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                Fun Facts
              </h4>
              <ul className="space-y-2">
                {insights.funFacts.map((fact, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-accent">•</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="p-6">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Suggestions for You
              </h4>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 text-xs">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reading Streak */}
          <div className="p-6 bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
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
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Your Reading Journey
                </p>
                <p className="font-medium text-foreground">
                  {insights.readingStreak}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setShowFullInsights(!showFullInsights)}
        className="w-full py-3 px-6 text-sm font-medium text-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
      >
        {showFullInsights ? (
          <>
            Show Less
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </>
        ) : (
          <>
            View Full Insights
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}

function ReadingInsightsSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
      </div>
      <div className="p-6 border-b border-border">
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-4 border-b border-border">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="p-4 text-center border-r last:border-r-0 border-border"
          >
            <div className="h-8 w-12 bg-muted rounded mx-auto mb-1" />
            <div className="h-3 w-16 bg-muted rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="py-3 px-6">
        <div className="h-4 w-24 bg-muted rounded mx-auto" />
      </div>
    </div>
  );
}
