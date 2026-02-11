'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';
import { BookCard, BookCardSkeleton } from '@/components/books/BookCard';

const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'VERY_GOOD', label: 'Very Good' },
  { value: 'GOOD', label: 'Good' },
  { value: 'ACCEPTABLE', label: 'Acceptable' },
] as const;

export function BookGrid() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        setDebouncedSearch(value);
      }, 300)
    );
  };

  type BookCondition = 'NEW' | 'LIKE_NEW' | 'VERY_GOOD' | 'GOOD' | 'ACCEPTABLE';

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.book.getAll.useInfiniteQuery(
    {
      limit: 12,
      condition: (selectedCondition || undefined) as BookCondition | undefined,
      search: debouncedSearch || undefined,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

  const allBooks = data?.pages.flatMap(page => page.books) ?? [];

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-0 lg:px-0 border-b border-border/50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by title, author, location, or Digital ID..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <svg
                  className="w-4 h-4 text-muted-foreground"
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
            )}
          </div>

          {/* Condition Filter */}
          <div className="relative sm:w-48">
            <select
              value={selectedCondition}
              onChange={e => setSelectedCondition(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-secondary/50 border border-border text-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 cursor-pointer"
            >
              {CONDITIONS.map(condition => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
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
          </div>
        </div>

        {/* Active Filters */}
        {(debouncedSearch || selectedCondition) && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                &ldquo;{debouncedSearch}&rdquo;
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearch('');
                  }}
                  className="hover:text-accent/70"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {selectedCondition && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                {CONDITIONS.find(c => c.value === selectedCondition)?.label}
                <button
                  onClick={() => setSelectedCondition('')}
                  className="hover:text-accent/70"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearch('');
                setSelectedCondition('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {allBooks.length === 0
            ? 'No books found'
            : `Showing ${allBooks.length} book${allBooks.length !== 1 ? 's' : ''
            }`}
        </p>
      )}

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load books
          </h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      ) : allBooks.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
            <svg
              className="w-10 h-10 text-muted-foreground"
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
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No books available
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {debouncedSearch || selectedCondition
              ? 'Try adjusting your filters to find more books.'
              : 'Be the first to list a book for exchange!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {allBooks.map(book => (
              <BookCard
                key={book.id}
                id={book.id}
                digitalId={book.digitalId}
                title={book.title}
                author={book.author}
                condition={book.condition}
                images={book.images}
                location={book.location}
                pointValue={book.pointValue}
                owner={book.owner}
                currentUserId={session?.user?.id}
              />
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isFetchingNextPage ? (
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
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Books
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
          )}
        </>
      )}
    </div>
  );
}
