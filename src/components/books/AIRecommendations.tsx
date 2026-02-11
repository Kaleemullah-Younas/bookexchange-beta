'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';

const conditionColors: Record<string, string> = {
  NEW: 'bg-accent/10 text-accent border-accent/20',
  LIKE_NEW:
    'bg-accent/10 text-accent-dark dark:text-accent-light border-accent/20',
  VERY_GOOD: 'bg-foreground/5 text-foreground/80 border-foreground/10',
  GOOD: 'bg-muted text-muted-foreground border-border',
  ACCEPTABLE: 'bg-muted text-muted-foreground border-border',
};

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  VERY_GOOD: 'Very Good',
  GOOD: 'Good',
  ACCEPTABLE: 'Acceptable',
};

interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  condition: string;
  images: string[];
  pointValue: number | null;
  location: string;
  owner: {
    id: string;
    name: string;
    image: string | null;
  };
  aiScore?: number | null;
  aiReason?: string | null;
}

function RecommendationCard({ book }: { book: RecommendedBook }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
    >
      {/* AI Badge */}
      {book.aiReason && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-medium backdrop-blur-sm">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          AI Pick
        </div>
      )}

      {/* Image */}
      <div className="aspect-3/4 relative overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.images[0]}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Condition Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${
              conditionColors[book.condition]
            }`}
          >
            {conditionLabels[book.condition]}
          </span>
        </div>

        {/* Points Badge */}
        {book.pointValue && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-semibold">
            <svg
              className="w-3.5 h-3.5 text-accent"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
            </svg>
            {book.pointValue}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
          by {book.author}
        </p>

        {/* AI Reason */}
        {book.aiReason && (
          <div className="mt-3 flex items-start gap-2 p-2 rounded-lg bg-accent/5 border border-accent/10">
            <svg
              className="w-4 h-4 text-accent shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="text-xs text-accent-dark dark:text-accent-light line-clamp-2">
              {book.aiReason}
            </p>
          </div>
        )}

        {/* Location */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-1">{book.location}</span>
        </div>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border overflow-hidden"
        >
          <div className="aspect-3/4 bg-muted animate-shimmer" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-muted rounded animate-shimmer w-3/4" />
            <div className="h-3 bg-muted rounded animate-shimmer w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIRecommendations() {
  const { data: session } = useSession();

  // For logged-in users, get personalized recommendations
  const { data: recommendationData, isLoading: recLoading } =
    trpc.book.getRecommendations.useQuery(
      { limit: 6 },
      { enabled: !!session?.user }
    );

  // For non-logged-in users, get trending books
  const { data: trendingData, isLoading: trendingLoading } =
    trpc.book.getTrending.useQuery({ limit: 6 }, { enabled: !session?.user });

  const isLoading = session?.user ? recLoading : trendingLoading;
  const books = session?.user
    ? recommendationData?.recommendations
    : trendingData?.books;
  const isPersonalized = recommendationData?.isPersonalized ?? false;

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-48 bg-muted rounded animate-shimmer" />
        </div>
        <LoadingSkeleton />
      </section>
    );
  }

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10">
            {session?.user && isPersonalized ? (
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-accent"
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
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {session?.user && isPersonalized
                ? 'Recommended for You'
                : 'Trending Books'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {session?.user && isPersonalized
                ? 'AI-powered picks based on your reading profile'
                : 'Popular books in the community'}
            </p>
          </div>
        </div>

        {session?.user && isPersonalized && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Powered by AI
          </div>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {books.filter(Boolean).map(book => (
          <RecommendationCard key={book!.id} book={book as RecommendedBook} />
        ))}
      </div>

      {/* Sign in prompt for non-users */}
      {!session?.user && (
        <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">
                Get Personalized Recommendations
              </p>
              <p className="text-sm text-muted-foreground">
                Sign in to receive AI-powered book suggestions tailored to you
              </p>
            </div>
          </div>
          <Link
            href="/signin"
            className="shrink-0 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      )}
    </section>
  );
}
