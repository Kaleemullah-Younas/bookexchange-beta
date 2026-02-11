'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';

// Star Rating Component
function StarRating({
  rating,
  size = 'md',
}: {
  rating: number;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'text-accent fill-accent'
              : 'text-muted-foreground/30'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Interactive Star Rating for input
function StarRatingInput({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <svg
            className={`w-7 h-7 ${
              star <= (hovered ?? value ?? 0)
                ? 'text-accent fill-accent'
                : 'text-muted-foreground/30'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// History Entry Card
function HistoryEntryCard({
  entry,
  index,
}: {
  entry: {
    id: string;
    readerName: string;
    readerAvatar: string | null;
    city: string;
    country?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    durationDays?: number | null;
    note?: string | null;
    tip?: string | null;
    rating?: number | null;
    isAnonymous: boolean;
    createdAt: Date | string;
  };
  index: number;
}) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-linear-to-b from-accent/50 to-transparent" />

      <div className="relative flex gap-4">
        {/* Timeline dot */}
        <div className="relative z-10 shrink-0">
          <div className="w-12 h-12 rounded-full bg-card border-2 border-accent flex items-center justify-center shadow-lg">
            {entry.readerAvatar && !entry.isAnonymous ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.readerAvatar}
                alt={entry.readerName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-accent">{index + 1}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground">
                  {entry.readerName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {entry.city}
                    {entry.country && `, ${entry.country}`}
                  </span>
                </div>
              </div>
              {entry.rating && <StarRating rating={entry.rating} size="sm" />}
            </div>

            {/* Reading duration */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1.5">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(entry.startDate)}</span>
                {entry.endDate && (
                  <>
                    <span>→</span>
                    <span>{formatDate(entry.endDate)}</span>
                  </>
                )}
              </div>
              {entry.durationDays && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 rounded-full">
                  <svg
                    className="w-3.5 h-3.5 text-accent"
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
                  <span className="text-xs font-medium text-accent">
                    {entry.durationDays} days
                  </span>
                </div>
              )}
            </div>

            {/* Note */}
            {entry.note && (
              <p className="text-foreground/80 text-sm leading-relaxed mb-3">
                {entry.note}
              </p>
            )}

            {/* Tip */}
            {entry.tip && (
              <div className="flex gap-2 p-3 bg-accent/5 rounded-xl border border-accent/20">
                <svg
                  className="w-5 h-5 text-accent shrink-0 mt-0.5"
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
                <div>
                  <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                    Tip for next reader
                  </span>
                  <p className="text-sm text-foreground/70 mt-0.5">
                    {entry.tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Entry Form
function AddEntryForm({
  digitalId,
  onSuccess,
}: {
  digitalId: string;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    note: '',
    tip: '',
    rating: undefined as number | undefined,
    isAnonymous: false,
  });
  const [isOpen, setIsOpen] = useState(false);

  const utils = trpc.useUtils();
  const addEntry = trpc.bookHistory.addEntry.useMutation({
    onSuccess: () => {
      utils.bookHistory.getByDigitalId.invalidate({ digitalId });
      utils.bookHistory.hasUserAddedEntry.invalidate({ digitalId });
      setFormData({
        city: '',
        country: '',
        startDate: '',
        endDate: '',
        note: '',
        tip: '',
        rating: undefined,
        isAnonymous: false,
      });
      setIsOpen(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry.mutate({
      bookDigitalId: digitalId,
      city: formData.city,
      country: formData.country || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      note: formData.note || undefined,
      tip: formData.tip || undefined,
      rating: formData.rating,
      isAnonymous: formData.isAnonymous,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 hover:border-accent transition-all duration-200 group"
      >
        <div className="flex items-center justify-center gap-3 text-accent">
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform"
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
          <span className="font-semibold">Add Your Reading Journey</span>
        </div>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Share Your Journey
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
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

      <div className="space-y-5">
        {/* Location */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              City <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder="Where did you read this?"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={e =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="Country (optional)"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Started Reading <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Finished Reading
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={e =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Rating
          </label>
          <StarRatingInput
            value={formData.rating}
            onChange={rating => setFormData({ ...formData, rating })}
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Note
          </label>
          <textarea
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            placeholder="Share your thoughts about this book..."
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formData.note.length}/500
          </p>
        </div>

        {/* Tip */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tip for Next Reader
          </label>
          <textarea
            value={formData.tip}
            onChange={e => setFormData({ ...formData, tip: e.target.value })}
            placeholder="Any tips or suggestions for the next reader?"
            maxLength={300}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formData.tip.length}/300
          </p>
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isAnonymous}
            onChange={e =>
              setFormData({ ...formData, isAnonymous: e.target.checked })
            }
            className="w-5 h-5 rounded border-border text-accent focus:ring-accent/50"
          />
          <span className="text-sm text-foreground">Post anonymously</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={addEntry.isPending}
          className="w-full py-3 px-6 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addEntry.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </span>
          ) : (
            'Add to Book History'
          )}
        </button>

        {addEntry.error && (
          <p className="text-sm text-destructive text-center">
            {addEntry.error.message}
          </p>
        )}
      </div>
    </form>
  );
}

export default function BookHistoryPage() {
  const params = useParams();
  const { data: session } = useSession();
  const digitalId = params.digitalId as string;

  const { data, isLoading, isError, error } =
    trpc.bookHistory.getByDigitalId.useQuery(
      { digitalId },
      { enabled: !!digitalId }
    );

  const { data: userEntry } = trpc.bookHistory.hasUserAddedEntry.useQuery(
    { digitalId },
    { enabled: !!digitalId && !!session?.user }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          {/* Header skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-32 bg-muted rounded-xl animate-shimmer" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-3/4 bg-muted rounded animate-shimmer" />
              <div className="h-5 w-1/2 bg-muted rounded animate-shimmer" />
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-24 bg-muted rounded-xl animate-shimmer"
              />
            ))}
          </div>
          {/* Timeline skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-40 bg-muted rounded-xl animate-shimmer"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 mb-6">
            <svg
              className="w-10 h-10 text-destructive"
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
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Book Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            {error?.message ||
              "The QR code you scanned doesn't match any book in our system."}
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-200"
          >
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { book, stats, entries } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 mb-6"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Books
          </Link>

          {/* Book Info Card */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex gap-6">
              {/* Book Image */}
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.images[0]}
                  alt={book.title}
                  className="w-28 h-40 object-cover rounded-xl shadow-md"
                />
              </div>

              {/* Book Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1 line-clamp-2">
                      {book.title}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      by {book.author}
                    </p>
                  </div>
                  <Link
                    href={`/books/${book.id}`}
                    className="shrink-0 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    View Book
                  </Link>
                </div>

                {/* Journey Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Book&apos;s Journey
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1">
              {stats.totalReaders}
            </div>
            <div className="text-sm text-muted-foreground">Readers</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1">
              {stats.totalCities}
            </div>
            <div className="text-sm text-muted-foreground">Cities</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1">
              {stats.totalCountries || 0}
            </div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1">
              {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </div>
        </div>

        {/* Add Entry Section (for logged in users who haven't added an entry) */}
        {session?.user && !userEntry?.hasEntry && (
          <div className="mb-8">
            <AddEntryForm digitalId={digitalId} onSuccess={() => {}} />
          </div>
        )}

        {/* Already added notice */}
        {session?.user && userEntry?.hasEntry && (
          <div className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-accent shrink-0"
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
            <span className="text-sm text-foreground">
              You&apos;ve already added your journey to this book&apos;s
              history!
            </span>
          </div>
        )}

        {/* Sign in prompt for non-logged in users */}
        {!session?.user && (
          <div className="mb-8 p-6 rounded-2xl bg-secondary/50 border border-border text-center">
            <svg
              className="w-12 h-12 text-muted-foreground mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Join This Book&apos;s Journey
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign in to add your reading experience to this book&apos;s history
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Reading Timeline
          </h2>

          {entries.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <svg
                className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Reading History Yet
              </h3>
              <p className="text-muted-foreground">
                Be the first to add your reading journey!
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {entries.map((entry, index) => (
                <HistoryEntryCard key={entry.id} entry={entry} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* QR Code Info */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Book ID:{' '}
            <code className="px-2 py-1 bg-muted rounded text-xs">
              {digitalId}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
