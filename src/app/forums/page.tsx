'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc';
import { DiscussionCard } from '@/components/forum/DiscussionCard';
import { CategorySidebar } from '@/components/forum/CategorySidebar';
import { CreateDiscussionModal } from '@/components/forum/CreateDiscussionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Search, Filter, X, TrendingUp, Shield, Tag } from 'lucide-react';
import Link from 'next/link';

export default function ForumsPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const {
    data: discussionsData,
    isLoading,
    error,
  } = trpc.forum.getDiscussions.useQuery({
    category: (selectedCategory ?? undefined) as
      | 'READER_DISCUSSIONS'
      | 'CHAPTER_DEBATES'
      | 'INTERPRETATIONS'
      | 'READING_GUIDANCE'
      | 'BOOK_REVIEWS'
      | 'RECOMMENDATIONS'
      | 'GENERAL'
      | undefined,
    search: searchQuery || undefined,
    limit: 20,
  });

  const { data: categoryStats } = trpc.forum.getCategoryStats.useQuery();
  const { data: trendingDiscussions } = trpc.forum.getTrending.useQuery({
    limit: 3,
  });

  const discussions = discussionsData?.discussions || [];

  if (error) {
    console.error('Forum query error:', error);
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
              className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6 text-accent" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Community Forums
              </h1>
              <p className="text-muted-foreground text-sm">
                Engage with fellow readers and share your thoughts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold shadow-lg shadow-accent/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Plus className="w-4 h-4" />
                New Discussion
              </motion.button>
            ) : (
              <Link href="/signin">
                <motion.div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In to Participate
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div className="sticky top-28 space-y-4">
              {/* Categories */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-accent" />
                  Categories
                </h2>
                <CategorySidebar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categoryStats={categoryStats || {}}
                />
              </div>

              {/* Trending */}
              {trendingDiscussions && trendingDiscussions.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-4">
                  <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    Trending Now
                  </h2>
                  <div className="space-y-2">
                    {trendingDiscussions.map((discussion, i) => (
                      <motion.div
                        key={discussion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={`/forums/${discussion.id}`}
                          className="block p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                        >
                          <h3 className="text-sm font-medium text-card-foreground line-clamp-2 group-hover:text-accent transition-colors">
                            {discussion.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              💬 {discussion._count.replies}
                            </span>
                            <span className="flex items-center gap-1">
                              ❤️ {discussion._count.reactions}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guidelines */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h2 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  Guidelines
                </h2>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Be respectful and constructive
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Stay on topic
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Use spoiler warnings
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    No hate speech or harassment
                  </li>
                </ul>
              </div>
            </div>
          </motion.aside>

          {/* Mobile Category Toggle */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <motion.button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-card-foreground text-sm font-medium"
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-4 h-4" />
              {selectedCategory ? selectedCategory.replace(/_/g, ' ') : 'All Categories'}
            </motion.button>
          </div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {showMobileSidebar && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                  onClick={() => setShowMobileSidebar(false)}
                />
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-full bg-card p-6 overflow-y-auto z-50 border-r border-border"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-card-foreground">Categories</h2>
                    <motion.button
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-2 rounded-xl hover:bg-secondary"
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <CategorySidebar
                    selectedCategory={selectedCategory}
                    onSelectCategory={cat => {
                      setSelectedCategory(cat);
                      setShowMobileSidebar(false);
                    }}
                    categoryStats={categoryStats || {}}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search discussions..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-card-foreground placeholder:text-muted-foreground"
                />
              </div>

              {session && (
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  New
                </motion.button>
              )}
            </motion.div>

            {/* Active Filter */}
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <span className="text-sm text-muted-foreground">Showing:</span>
                <span className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-sm font-medium">
                  {selectedCategory.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </motion.div>
            )}

            {/* Discussions List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl bg-card border border-border p-5 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 w-28 bg-secondary rounded-full" />
                      <div className="h-4 w-20 bg-secondary rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-secondary rounded mb-2" />
                    <div className="h-4 w-full bg-secondary rounded mb-1" />
                    <div className="h-4 w-2/3 bg-secondary rounded" />
                  </motion.div>
                ))}
              </div>
            ) : discussions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-card border border-border rounded-2xl"
              >
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  No discussions yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No discussions match your search. Try a different query.'
                    : 'Be the first to start a discussion in this category!'}
                </p>
                {session && (
                  <motion.button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5" />
                    Start a Discussion
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {discussions.map((discussion, i) => (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <DiscussionCard
                      id={discussion.id}
                      title={discussion.title}
                      content={discussion.content}
                      category={discussion.category}
                      authorName={discussion.authorName}
                      isAnonymous={discussion.isAnonymous}
                      bookTitle={discussion.bookTitle}
                      bookAuthor={discussion.bookAuthor}
                      chapter={discussion.chapter}
                      viewCount={discussion.viewCount}
                      replyCount={discussion._count.replies}
                      reactionCounts={discussion.reactionCounts}
                      createdAt={discussion.createdAt}
                      isPinned={discussion.isPinned}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
