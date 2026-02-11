'use client';

import Link from 'next/link';
import { useState } from 'react';

interface BookCardProps {
  id: string;
  digitalId: string;
  title: string;
  author: string;
  condition: string;
  images: string[];
  location: string;
  pointValue?: number | null;
  owner: {
    id: string;
    name: string;
    image: string | null;
  };
  currentUserId?: string; // For hiding chat icon on own books
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  NEW: {
    label: 'New',
    color: 'bg-accent/10 text-accent border border-accent/20',
  },
  LIKE_NEW: {
    label: 'Like New',
    color:
      'bg-accent/10 text-accent-dark dark:text-accent-light border border-accent/20',
  },
  VERY_GOOD: {
    label: 'Very Good',
    color: 'bg-foreground/5 text-foreground/80 border border-foreground/10',
  },
  GOOD: {
    label: 'Good',
    color: 'bg-muted text-muted-foreground border border-border',
  },
  ACCEPTABLE: {
    label: 'Acceptable',
    color: 'bg-muted text-muted-foreground border border-border',
  },
};

export function BookCard({
  id,
  digitalId,
  title,
  author,
  condition,
  images,
  location,
  pointValue,
  owner,
  currentUserId,
}: BookCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const conditionInfo = conditionLabels[condition] || {
    label: condition,
    color: 'bg-muted text-muted-foreground',
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/chat?bookId=${id}&ownerId=${owner.id}`;
  };

  return (
    <Link href={`/books/${id}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-500 hover:border-border hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {!imageLoaded && <div className="absolute inset-0 animate-shimmer" />}
          <img
            src={images[currentImageIndex] || '/placeholder-book.jpg'}
            alt={title}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-black/60"
                aria-label="Previous image"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-black/60"
                aria-label="Next image"
              >
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Image Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Condition Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${conditionInfo.color}`}
            >
              {conditionInfo.label}
            </span>
          </div>

          {/* Digital ID Badge */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[10px] font-mono">
              <svg
                className="w-3 h-3"
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
              {digitalId.slice(0, 8)}
            </span>
          </div>

          {/* Chat Button - only show if not own book */}
          {currentUserId && currentUserId !== owner.id && (
            <button
              onClick={handleChatClick}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-accent text-accent-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-accent-dark hover:scale-110 shadow-lg shadow-accent/30"
              aria-label="Chat with owner"
              title="Chat with owner"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-card-foreground leading-snug line-clamp-1 group-hover:text-accent transition-colors duration-300">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            by {author}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
              <span className="line-clamp-1">{location}</span>
            </div>
            {pointValue && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                </svg>
                {pointValue}
              </div>
            )}
          </div>

          {/* Owner */}
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center overflow-hidden">
              {owner.image ? (
                <img
                  src={owner.image}
                  alt={owner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-medium text-accent">
                  {owner.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {owner.name}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card border border-border/50">
      <div className="aspect-[4/5] bg-muted animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-shimmer w-3/4" />
        <div className="h-4 bg-muted rounded animate-shimmer w-1/2" />
        <div className="h-4 bg-muted rounded animate-shimmer w-2/3" />
        <div className="pt-3 border-t border-border/50 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted animate-shimmer" />
          <div className="h-3 bg-muted rounded animate-shimmer w-20" />
        </div>
      </div>
    </div>
  );
}
