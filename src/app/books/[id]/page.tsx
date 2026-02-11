'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';
import { BookValueCard } from '@/components/exchange/BookValueCard';
import { RequestBookModal } from '@/components/exchange/RequestBookModal';
import { BookQRCode } from '@/components/books/BookQRCode';
import { ReadingTimeEstimate } from '@/components/books/ReadingTimeEstimate';

const conditionLabels: Record<
  string,
  { label: string; color: string; description: string }
> = {
  NEW: {
    label: 'New',
    color: 'bg-accent/10 text-accent border-accent/20',
    description: 'Brand new, unread, perfect condition',
  },
  LIKE_NEW: {
    label: 'Like New',
    color:
      'bg-accent/10 text-accent-dark dark:text-accent-light border-accent/20',
    description: 'Barely used, no visible wear',
  },
  VERY_GOOD: {
    label: 'Very Good',
    color: 'bg-foreground/5 text-foreground/80 border-foreground/10',
    description: 'Minor wear, no markings or highlights',
  },
  GOOD: {
    label: 'Good',
    color: 'bg-muted text-muted-foreground border-border',
    description: 'Some wear, may have minor markings',
  },
  ACCEPTABLE: {
    label: 'Acceptable',
    color: 'bg-muted text-muted-foreground border-border',
    description: 'Readable condition, visible wear',
  },
};

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const bookId = params.id as string;

  const {
    data: book,
    isLoading,
    isError,
  } = trpc.book.getById.useQuery({ id: bookId }, { enabled: !!bookId });

  // Check if user has already requested this book
  const { data: requestStatus } = trpc.exchange.hasUserRequestedBook.useQuery(
    { bookId },
    { enabled: !!bookId && !!session?.user }
  );

  const utils = trpc.useUtils();

  const deleteBook = trpc.book.delete.useMutation({
    onSuccess: () => {
      utils.book.getAll.invalidate();
      router.push('/books');
    },
  });

  const toggleAvailability = trpc.book.toggleAvailability.useMutation({
    onSuccess: () => {
      utils.book.getById.invalidate({ id: bookId });
      utils.book.getAll.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {/* Back Button Skeleton */}
          <div className="h-10 w-32 bg-muted rounded-lg animate-shimmer mb-8" />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Skeleton */}
            <div className="aspect-[4/5] rounded-2xl bg-muted animate-shimmer" />

            {/* Content Skeleton */}
            <div className="space-y-6">
              <div className="h-8 w-24 bg-muted rounded-full animate-shimmer" />
              <div className="h-10 w-3/4 bg-muted rounded animate-shimmer" />
              <div className="h-6 w-1/2 bg-muted rounded animate-shimmer" />
              <div className="h-32 w-full bg-muted rounded-xl animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
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
            The book you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-200"
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
        </div>
      </div>
    );
  }

  const conditionInfo = conditionLabels[book.condition] || {
    label: book.condition,
    color: 'bg-muted text-muted-foreground border-border',
    description: '',
  };
  const isOwner = session?.user?.id === book.ownerId;
  const formattedDate = new Date(book.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Back Navigation */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 mb-8"
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

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
              <img
                src={book.images[currentImageIndex]}
                alt={book.title}
                className="w-full h-full object-cover"
              />

              {/* Availability Badge */}
              {!book.isAvailable && (
                <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-black/80 text-white font-medium">
                  Not Available
                </div>
              )}

              {/* Image Navigation */}
              {book.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        prev =>
                          (prev - 1 + book.images.length) % book.images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                    aria-label="Previous image"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        prev => (prev + 1) % book.images.length
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                    aria-label="Next image"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {book.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {book.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                      index === currentImageIndex
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-background'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${book.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            {/* Condition Badge */}
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full border ${conditionInfo.color}`}
            >
              <span className="font-medium">{conditionInfo.label}</span>
              <span className="mx-2 w-1 h-1 rounded-full bg-current opacity-40" />
              <span className="text-sm opacity-80">
                {conditionInfo.description}
              </span>
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {book.title}
              </h1>
              <p className="mt-2 text-xl text-muted-foreground">
                by {book.author}
              </p>
              {/* Book Points Badge */}
              {book.pointValue && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                  </svg>
                  <span className="text-lg font-bold text-accent">
                    {book.pointValue} points
                  </span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-accent/10">
                    AI Generated
                  </span>
                </div>
              )}
            </div>

            {/* Digital Identity */}
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-accent uppercase tracking-wide font-medium">
                    Unique Digital ID
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {book.digitalId}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                This unique identifier ensures this book has a single digital
                identity in our system.
              </p>
            </div>

            {/* QR Code for Book History */}
            <BookQRCode digitalId={book.digitalId} bookTitle={book.title} />

            {/* Reading Time Estimate */}
            <ReadingTimeEstimate bookId={book.id} />

            {/* Description */}
            {book.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  About This Book
                </h3>
                <p className="text-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
              <svg
                className="w-5 h-5 text-accent mt-0.5"
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
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{book.location}</p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-3">Listed by</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center overflow-hidden">
                  {book.owner.image ? (
                    <img
                      src={book.owner.image}
                      alt={book.owner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-accent">
                      {book.owner.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {book.owner.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Listed on {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {isOwner ? (
                <>
                  <button
                    onClick={() => toggleAvailability.mutate({ id: book.id })}
                    disabled={toggleAvailability.isPending}
                    className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      book.isAvailable
                        ? 'bg-warning/10 text-warning hover:bg-warning/20'
                        : 'bg-success/10 text-success hover:bg-success/20'
                    }`}
                  >
                    {toggleAvailability.isPending ? (
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
                    ) : book.isAvailable ? (
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
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        Mark as Unavailable
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Mark as Available
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-6 py-4 rounded-xl bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20 transition-all duration-200 flex items-center justify-center gap-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove Listing
                  </button>
                </>
              ) : book.isAvailable ? (
                <div className="space-y-4">
                  {/* AI Book Value Card */}
                  <BookValueCard bookId={book.id} />

                  {/* Request Book Button */}
                  {requestStatus?.hasRequested ? (
                    <button
                      disabled
                      className="w-full px-6 py-4 rounded-xl bg-muted text-muted-foreground font-semibold cursor-not-allowed flex items-center justify-center gap-2"
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {requestStatus.requestStatus === 'ACCEPTED'
                        ? 'Request Accepted - Awaiting Exchange'
                        : 'Requested - Pending Approval'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full px-6 py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Request This Book
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full px-6 py-4 rounded-xl bg-muted text-muted-foreground font-semibold text-center">
                  This book is currently unavailable
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <svg
                  className="w-8 h-8 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Remove this listing?
              </h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. The book &ldquo;{book.title}
                &rdquo; will be permanently removed from the exchange.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary/50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteBook.mutate({ id: book.id })}
                  disabled={deleteBook.isPending}
                  className="flex-1 px-4 py-3 rounded-xl bg-destructive text-white font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteBook.isPending ? (
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
                  ) : (
                    'Yes, Remove'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Book Modal */}
      <RequestBookModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        book={{
          id: book.id,
          title: book.title,
          author: book.author,
          images: book.images,
          condition: book.condition,
          owner: {
            name: book.owner.name,
          },
        }}
      />
    </div>
  );
}
