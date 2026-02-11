'use client';

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categoryStats: Record<string, number>;
}

const categories = [
  {
    value: 'READER_DISCUSSIONS',
    label: 'Reader Discussions',
    icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
    color: 'text-blue-500',
  },
  {
    value: 'CHAPTER_DEBATES',
    label: 'Chapter Debates',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    color: 'text-purple-500',
  },
  {
    value: 'INTERPRETATIONS',
    label: 'Interpretations',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    color: 'text-amber-500',
  },
  {
    value: 'READING_GUIDANCE',
    label: 'Reading Guidance',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'text-green-500',
  },
  {
    value: 'BOOK_REVIEWS',
    label: 'Book Reviews',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    color: 'text-pink-500',
  },
  {
    value: 'RECOMMENDATIONS',
    label: 'Recommendations',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    color: 'text-cyan-500',
  },
  {
    value: 'GENERAL',
    label: 'General',
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
    color: 'text-gray-500',
  },
];

export function CategorySidebar({
  selectedCategory,
  onSelectCategory,
  categoryStats,
}: CategorySidebarProps) {
  const totalDiscussions = Object.values(categoryStats).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-2">
      {/* All Discussions */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
          selectedCategory === null
            ? 'bg-accent/10 text-accent border border-accent/20'
            : 'hover:bg-secondary text-muted-foreground hover:text-card-foreground'
        }`}
      >
        <div className="flex items-center gap-3">
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
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          <span className="text-sm font-medium">All Discussions</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
          {totalDiscussions}
        </span>
      </button>

      <div className="h-px bg-border my-3" />

      {/* Categories */}
      {categories.map(cat => (
        <button
          key={cat.value}
          onClick={() => onSelectCategory(cat.value)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
            selectedCategory === cat.value
              ? 'bg-accent/10 text-accent border border-accent/20'
              : 'hover:bg-secondary text-muted-foreground hover:text-card-foreground'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className={`w-5 h-5 ${
                selectedCategory === cat.value ? 'text-accent' : cat.color
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={cat.icon}
              />
            </svg>
            <span className="text-sm font-medium">{cat.label}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
            {categoryStats[cat.value] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}
