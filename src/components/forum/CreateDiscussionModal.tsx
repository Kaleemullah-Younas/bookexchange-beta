'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = [
  {
    value: 'READER_DISCUSSIONS',
    label: 'Reader Discussions',
    description: 'General discussions about books and reading',
  },
  {
    value: 'CHAPTER_DEBATES',
    label: 'Chapter Debates',
    description: 'Discuss specific chapters in detail',
  },
  {
    value: 'INTERPRETATIONS',
    label: 'Interpretations',
    description: 'Share your interpretations and opinions',
  },
  {
    value: 'READING_GUIDANCE',
    label: 'Reading Guidance',
    description: 'Tips and insights for readers',
  },
  {
    value: 'BOOK_REVIEWS',
    label: 'Book Reviews',
    description: 'Share your book reviews',
  },
  {
    value: 'RECOMMENDATIONS',
    label: 'Recommendations',
    description: 'Recommend books to others',
  },
  { value: 'GENERAL', label: 'General', description: 'Other discussions' },
];

export function CreateDiscussionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDiscussionModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('READER_DISCUSSIONS');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [chapter, setChapter] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showBookFields, setShowBookFields] = useState(false);
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const createDiscussion = trpc.forum.createDiscussion.useMutation({
    onSuccess: () => {
      utils.forum.getDiscussions.invalidate();
      utils.forum.getCategoryStats.invalidate();
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: err => {
      setError(err.message);
    },
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('READER_DISCUSSIONS');
    setBookTitle('');
    setBookAuthor('');
    setChapter('');
    setIsAnonymous(false);
    setShowBookFields(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (content.length < 20) {
      setError('Content must be at least 20 characters');
      return;
    }

    createDiscussion.mutate({
      title,
      content,
      category: category as
        | 'READER_DISCUSSIONS'
        | 'CHAPTER_DEBATES'
        | 'INTERPRETATIONS'
        | 'READING_GUIDANCE'
        | 'BOOK_REVIEWS'
        | 'RECOMMENDATIONS'
        | 'GENERAL',
      bookTitle: bookTitle || undefined,
      bookAuthor: bookAuthor || undefined,
      chapter: chapter || undefined,
      isAnonymous,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">
              Start a Discussion
            </h2>
            <p className="text-sm text-muted-foreground">
              Share your thoughts with the community
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl text-left transition-all duration-200 ${
                    category === cat.value
                      ? 'bg-accent/10 border-2 border-accent text-accent'
                      : 'bg-secondary/50 border-2 border-transparent hover:border-accent/30'
                  }`}
                >
                  <div className="text-sm font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-card-foreground mb-2"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What would you like to discuss?"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-card-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-card-foreground mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-card-foreground placeholder:text-muted-foreground resize-none"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {content.length}/10000 characters
            </p>
          </div>

          {/* Book Details Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowBookFields(!showBookFields)}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  showBookFields ? 'rotate-180' : ''
                }`}
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
              {showBookFields ? 'Hide' : 'Add'} book details (optional)
            </button>

            {showBookFields && (
              <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="bookTitle"
                      className="block text-sm font-medium text-card-foreground mb-1"
                    >
                      Book Title
                    </label>
                    <input
                      id="bookTitle"
                      type="text"
                      value={bookTitle}
                      onChange={e => setBookTitle(e.target.value)}
                      placeholder="e.g., 1984"
                      className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-card-foreground placeholder:text-muted-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bookAuthor"
                      className="block text-sm font-medium text-card-foreground mb-1"
                    >
                      Author
                    </label>
                    <input
                      id="bookAuthor"
                      type="text"
                      value={bookAuthor}
                      onChange={e => setBookAuthor(e.target.value)}
                      placeholder="e.g., George Orwell"
                      className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-card-foreground placeholder:text-muted-foreground text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="chapter"
                    className="block text-sm font-medium text-card-foreground mb-1"
                  >
                    Chapter (optional)
                  </label>
                  <input
                    id="chapter"
                    type="text"
                    value={chapter}
                    onChange={e => setChapter(e.target.value)}
                    placeholder="e.g., Chapter 3 or Part Two"
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-card-foreground placeholder:text-muted-foreground text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                isAnonymous ? 'bg-accent' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  isAnonymous ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <div>
              <div className="text-sm font-medium text-card-foreground">
                Post anonymously
              </div>
              <div className="text-xs text-muted-foreground">
                Your identity will be hidden from other users
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-card-foreground hover:bg-secondary transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDiscussion.isPending}
              className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createDiscussion.isPending ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  Creating...
                </>
              ) : (
                <>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Discussion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
