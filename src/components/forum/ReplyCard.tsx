'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';

interface ReplyCardProps {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  isEdited: boolean;
  createdAt: Date | string;
  reactionCounts: Record<string, number>;
  discussionId: string;
  parentId?: string | null;
}

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

export function ReplyCard({
  id,
  content,
  authorId,
  authorName,
  isAnonymous,
  isEdited,
  createdAt,
  reactionCounts,
  discussionId,
}: ReplyCardProps) {
  const { data: session } = useSession();
  const [showActions, setShowActions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const utils = trpc.useUtils();
  const isAuthor = session?.user?.id === authorId;

  const toggleReaction = trpc.forum.toggleReaction.useMutation({
    onSuccess: () => {
      utils.forum.getDiscussionById.invalidate({ id: discussionId });
    },
  });

  const editReply = trpc.forum.editReply.useMutation({
    onSuccess: () => {
      utils.forum.getDiscussionById.invalidate({ id: discussionId });
      setIsEditing(false);
    },
  });

  const deleteReply = trpc.forum.deleteReply.useMutation({
    onSuccess: () => {
      utils.forum.getDiscussionById.invalidate({ id: discussionId });
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
      replyId: id,
      type: type as 'LIKE' | 'HELPFUL' | 'INSIGHTFUL' | 'AGREE' | 'DISAGREE',
    });
  };

  const handleReport = () => {
    if (!reportReason) return;
    reportContent.mutate({
      replyId: id,
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

  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="relative group">
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isAnonymous
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-accent/10 text-accent'
              }`}
            >
              {isAnonymous ? '?' : authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-sm font-medium text-card-foreground">
                {authorName}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{timeAgo(createdAt)}</span>
                {isEdited && <span className="italic">(edited)</span>}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-card-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all duration-200"
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 py-1 rounded-lg bg-card border border-border shadow-lg z-20">
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-card-foreground hover:bg-secondary transition-colors flex items-center gap-2"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this reply?'
                            )
                          ) {
                            deleteReply.mutate({ id });
                          }
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                  {session && !isAuthor && (
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-card-foreground hover:bg-secondary transition-colors flex items-center gap-2"
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
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                      Report
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none text-card-foreground resize-none"
              rows={3}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(content);
                }}
                className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-card-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => editReply.mutate({ id, content: editContent })}
                disabled={editReply.isPending}
                className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-dark disabled:opacity-50"
              >
                {editReply.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-card-foreground whitespace-pre-wrap">
            {content}
          </p>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            {reactionTypes.map(({ type, emoji, label }) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={!session}
                title={label}
                className={`px-2 py-1 rounded-lg text-xs transition-all duration-200 flex items-center gap-1 ${
                  reactionCounts[type]
                    ? 'bg-accent/10 text-accent'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{emoji}</span>
                {reactionCounts[type] ? reactionCounts[type] : ''}
              </button>
            ))}
          </div>
          {totalReactions > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowReportModal(false)}
          />
          <div className="relative w-full max-w-md bg-card rounded-xl border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Report Content
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-accent outline-none text-card-foreground"
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
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  placeholder="Provide more context..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-accent outline-none text-card-foreground resize-none"
                />
              </div>

              <div className="flex items-center gap-2 justify-end pt-4">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-card-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason || reportContent.isPending}
                  className="px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
                >
                  {reportContent.isPending ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
