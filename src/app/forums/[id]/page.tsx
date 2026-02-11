'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';
import { ReplyForm } from '@/components/forum/ReplyForm';
import { ReplyCard } from '@/components/forum/ReplyCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreVertical, Edit, Trash2, Flag, Share2, Lock, Eye, MessageCircle, X } from 'lucide-react';

const categoryLabels: Record<string, { label: string; color: string; icon: string }> = {
  READER_DISCUSSIONS: {
    label: 'Reader Discussions',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
  },
  CHAPTER_DEBATES: {
    label: 'Chapter Debates',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  INTERPRETATIONS: {
    label: 'Interpretations',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  READING_GUIDANCE: {
    label: 'Reading Guidance',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
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

const reactionTypes = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'HELPFUL', emoji: '💡', label: 'Helpful' },
  { type: 'INSIGHTFUL', emoji: '🧠', label: 'Insightful' },
  { type: 'AGREE', emoji: '✅', label: 'Agree' },
  { type: 'DISAGREE', emoji: '❌', label: 'Disagree' },
];

const reportReasons = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'HATE_SPEECH', label: 'Hate Speech' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'MISINFORMATION', label: 'Misinformation' },
  { value: 'OFF_TOPIC', label: 'Off Topic' },
  { value: 'OTHER', label: 'Other' },
];

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [showActions, setShowActions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const discussionId = params.id as string;

  const {
    data: discussion,
    isLoading,
    isError,
  } = trpc.forum.getDiscussionById.useQuery(
    { id: discussionId },
    { enabled: !!discussionId }
  );

  const utils = trpc.useUtils();

  const toggleReaction = trpc.forum.toggleReaction.useMutation({
    onSuccess: () => {
      utils.forum.getDiscussionById.invalidate({ id: discussionId });
    },
  });

  const editDiscussion = trpc.forum.editDiscussion.useMutation({
    onSuccess: () => {
      utils.forum.getDiscussionById.invalidate({ id: discussionId });
      setIsEditing(false);
    },
  });

  const deleteDiscussion = trpc.forum.deleteDiscussion.useMutation({
    onSuccess: () => {
      router.push('/forums');
    },
  });

  const reportContent = trpc.forum.reportContent.useMutation({
    onSuccess: () => {
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    },
  });

  const handleReaction = (type: string) => {
    if (!session) return;
    toggleReaction.mutate({
      discussionId,
      type: type as 'LIKE' | 'HELPFUL' | 'INSIGHTFUL' | 'AGREE' | 'DISAGREE',
    });
  };

  const handleReport = () => {
    if (!reportReason) return;
    reportContent.mutate({
      discussionId,
      reason: reportReason as
        | 'SPAM'
        | 'HARASSMENT'
        | 'HATE_SPEECH'
        | 'INAPPROPRIATE'
        | 'MISINFORMATION'
        | 'OFF_TOPIC'
        | 'OTHER',
      description: reportDescription || undefined,
    });
  };

  const startEditing = () => {
    if (discussion) {
      setEditTitle(discussion.title);
      setEditContent(discussion.content);
      setIsEditing(true);
      setShowActions(false);
    }
  };

  const timeAgo = (date: Date | string) => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(date).getTime()) / 1000
    );

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="h-6 w-32 bg-secondary rounded-lg animate-pulse mb-8" />
          <div className="bg-card rounded-2xl border border-border p-6 animate-pulse">
            <div className="h-6 w-28 bg-secondary rounded-full mb-4" />
            <div className="h-8 w-3/4 bg-secondary rounded-lg mb-4" />
            <div className="h-4 w-full bg-secondary rounded mb-2" />
            <div className="h-4 w-full bg-secondary rounded mb-2" />
            <div className="h-4 w-2/3 bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !discussion) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Discussion Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            This discussion doesn&apos;t exist or has been removed.
          </p>
          <Link href="/forums">
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Forums
            </motion.div>
          </Link>
        </motion.div>
      </div>
    );
  }

  const categoryInfo = categoryLabels[discussion.category] || categoryLabels.GENERAL;
  const isAuthor = session?.user?.id === discussion.authorId;
  const totalReactions = Object.values(discussion.reactionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/forums"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Forums
          </Link>
        </motion.div>

        {/* Discussion Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Category & Book Info */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryInfo.color}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryInfo.icon} />
                    </svg>
                    {categoryInfo.label}
                  </span>
                  {discussion.bookTitle && (
                    <span className="text-sm text-muted-foreground">
                      📚 <span className="font-medium text-foreground">{discussion.bookTitle}</span>
                      {discussion.bookAuthor && <span> by {discussion.bookAuthor}</span>}
                      {discussion.chapter && <span className="text-accent"> • Ch. {discussion.chapter}</span>}
                    </span>
                  )}
                  {discussion.isLocked && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                {/* Title */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-secondary border border-border rounded-xl px-4 py-2 text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {discussion.title}
                  </h1>
                )}

                {/* Author & Meta */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${discussion.isAnonymous
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-accent/10 text-accent'
                      }`}>
                      {discussion.isAnonymous ? '?' : discussion.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {discussion.authorName}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {timeAgo(discussion.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {discussion.viewCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      {discussion._count.replies}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                  {showActions && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 py-1 rounded-xl bg-card border border-border shadow-xl z-20"
                      >
                        {isAuthor && (
                          <>
                            <button
                              onClick={startEditing}
                              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Discussion
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this discussion?')) {
                                  deleteDiscussion.mutate({ id: discussionId });
                                }
                                setShowActions(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Discussion
                            </button>
                          </>
                        )}
                        {session && !isAuthor && (
                          <button
                            onClick={() => {
                              setShowReportModal(true);
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                          >
                            <Flag className="w-4 h-4" />
                            Report
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Copy Link
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={8}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(discussion.title);
                      setEditContent(discussion.content);
                    }}
                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={() =>
                      editDiscussion.mutate({
                        id: discussionId,
                        title: editTitle,
                        content: editContent,
                      })
                    }
                    disabled={editDiscussion.isPending}
                    className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editDiscussion.isPending ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {discussion.content}
                </p>
              </div>
            )}
          </div>

          {/* Reactions */}
          <div className="px-6 pb-6">
            <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl bg-secondary/30 border border-border">
              <span className="text-sm text-muted-foreground mr-2">React:</span>
              {reactionTypes.map(({ type, emoji, label }) => (
                <motion.button
                  key={type}
                  onClick={() => handleReaction(type)}
                  disabled={!session}
                  title={label}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${discussion.reactionCounts[type]
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: session ? 1.05 : 1 }}
                  whileTap={{ scale: session ? 0.95 : 1 }}
                >
                  <span className="text-base">{emoji}</span>
                  <span className="font-medium">{discussion.reactionCounts[type] || 0}</span>
                </motion.button>
              ))}
              {totalReactions > 0 && (
                <span className="text-sm text-muted-foreground ml-auto">
                  {totalReactions} total
                </span>
              )}
            </div>
          </div>
        </motion.article>

        {/* Replies Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="text-xl font-bold text-foreground">
              Replies ({discussion._count.replies})
            </h2>
          </div>

          {/* Reply Form */}
          {session && !discussion.isLocked ? (
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Join the discussion</h3>
              <ReplyForm
                discussionId={discussionId}
                placeholder="Share your thoughts on this discussion..."
              />
            </div>
          ) : discussion.isLocked ? (
            <div className="bg-secondary/30 rounded-2xl border border-border p-6 mb-6 text-center">
              <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                This discussion is locked and no longer accepts new replies.
              </p>
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-2xl border border-border p-6 mb-6 text-center">
              <p className="text-muted-foreground">
                <Link href="/signin" className="text-accent hover:underline">
                  Sign in
                </Link>{' '}
                to join the discussion.
              </p>
            </div>
          )}

          {/* Replies List */}
          {discussion.replies.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No replies yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussion.replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <ReplyCard
                    id={reply.id}
                    content={reply.content}
                    authorId={reply.authorId}
                    authorName={reply.authorName}
                    isAnonymous={reply.isAnonymous}
                    isEdited={reply.isEdited}
                    createdAt={reply.createdAt}
                    reactionCounts={reply.reactionCounts}
                    discussionId={discussionId}
                    parentId={reply.parentId}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowReportModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Report Discussion</h3>
                <motion.button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-accent outline-none text-foreground"
                  >
                    <option value="">Select a reason</option>
                    {reportReasons.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={e => setReportDescription(e.target.value)}
                    placeholder="Provide more context..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-accent outline-none text-foreground resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleReport}
                    disabled={!reportReason || reportContent.isPending}
                    className="px-5 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {reportContent.isPending ? 'Submitting...' : 'Submit Report'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
