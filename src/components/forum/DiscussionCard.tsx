'use client';

import Link from 'next/link';

interface DiscussionCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  isAnonymous: boolean;
  bookTitle?: string | null;
  bookAuthor?: string | null;
  chapter?: string | null;
  viewCount: number;
  replyCount: number;
  reactionCounts: Record<string, number>;
  createdAt: Date | string;
  isPinned?: boolean;
}

const categoryLabels: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  READER_DISCUSSIONS: {
    label: 'Reader Discussions',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
  },
  CHAPTER_DEBATES: {
    label: 'Chapter Debates',
    color:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  INTERPRETATIONS: {
    label: 'Interpretations',
    color:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  READING_GUIDANCE: {
    label: 'Reading Guidance',
    color:
      'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  BOOK_REVIEWS: {
    label: 'Book Reviews',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  },
  RECOMMENDATIONS: {
    label: 'Recommendations',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
  GENERAL: {
    label: 'General',
    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
  },
};

export function DiscussionCard({
  id,
  title,
  content,
  category,
  authorName,
  isAnonymous,
  bookTitle,
  chapter,
  viewCount,
  replyCount,
  reactionCounts,
  createdAt,
  isPinned,
}: DiscussionCardProps) {
  const categoryInfo = categoryLabels[category] || categoryLabels.GENERAL;
  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const timeAgo = (date: Date | string) => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(date).getTime()) / 1000
    );

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/forums/${id}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
        {/* Pinned indicator */}
        {isPinned && (
          <div
            className="absolute top-0 right-0 w-0 h-0"
            style={{
              borderTop: '40px solid var(--accent)',
              borderLeft: '40px solid transparent',
            }}
          >
            <svg
              className="absolute -top-8 right-1 w-4 h-4 text-accent-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a1 1 0 011 1v1.323l3.954.592c.42.063.798.264 1.077.572.28.307.444.712.447 1.138L16.5 8.5a1 1 0 01-.553.894l-.428.214a3.5 3.5 0 00-1.894 2.48l-.413 2.064a1 1 0 01-.98.798h-.464a3 3 0 00-2.687 1.658l-.3.599a1 1 0 01-1.562.13l-.707-.707a3 3 0 00-2.121-.879H3.5a1 1 0 01-1-1v-.646a3 3 0 01.879-2.121l.707-.707a1 1 0 01.13-.106l2.564-1.282a3.5 3.5 0 002.095-3.2V4.5L9 3a1 1 0 011-1z" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryInfo.color}`}
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
                d={categoryInfo.icon}
              />
            </svg>
            {categoryInfo.label}
          </span>
          {bookTitle && (
            <span className="text-xs text-muted-foreground">
              📚 {bookTitle}
              {chapter && <span className="text-accent"> • Ch. {chapter}</span>}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-card-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-300 mb-2">
          {title}
        </h3>

        {/* Content preview */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isAnonymous
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-accent/10 text-accent'
                }`}
              >
                {isAnonymous ? '?' : authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground">
                {authorName}
              </span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(createdAt)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {viewCount}
            </span>
            <span className="flex items-center gap-1">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {replyCount}
            </span>
            <span className="flex items-center gap-1">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {totalReactions}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
