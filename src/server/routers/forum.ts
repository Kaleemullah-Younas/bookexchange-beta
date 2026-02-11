import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';

// Initialize bad-words filter
const filter = new Filter();

// Simple abuse detection function
function containsAbusiveContent(text: string): boolean {
  return filter.isProfane(text);
}

// Generate anonymous name
function generateAnonymousName(): string {
  const adjectives = [
    'Curious',
    'Thoughtful',
    'Wise',
    'Eager',
    'Passionate',
    'Avid',
    'Devoted',
    'Inspired',
  ];
  const nouns = [
    'Reader',
    'Scholar',
    'Bibliophile',
    'Explorer',
    'Thinker',
    'Seeker',
    'Learner',
    'Dreamer',
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${num}`;
}

// Zod schemas
const ForumCategoryEnum = z.enum([
  'READER_DISCUSSIONS',
  'CHAPTER_DEBATES',
  'INTERPRETATIONS',
  'READING_GUIDANCE',
  'BOOK_REVIEWS',
  'RECOMMENDATIONS',
  'GENERAL',
]);

const ReactionTypeEnum = z.enum([
  'LIKE',
  'HELPFUL',
  'INSIGHTFUL',
  'AGREE',
  'DISAGREE',
]);

const ReportReasonEnum = z.enum([
  'SPAM',
  'HARASSMENT',
  'HATE_SPEECH',
  'INAPPROPRIATE',
  'MISINFORMATION',
  'OFF_TOPIC',
  'OTHER',
]);

const createDiscussionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z
    .string()
    .min(20, 'Content must be at least 20 characters')
    .max(10000),
  category: ForumCategoryEnum,
  bookTitle: z.string().max(200).optional(),
  bookAuthor: z.string().max(100).optional(),
  chapter: z.string().max(100).optional(),
  isAnonymous: z.boolean().default(false),
});

const createReplySchema = z.object({
  discussionId: z.string(),
  content: z.string().min(5, 'Reply must be at least 5 characters').max(5000),
  isAnonymous: z.boolean().default(false),
  parentId: z.string().optional(),
});

const reportContentSchema = z.object({
  discussionId: z.string().optional(),
  replyId: z.string().optional(),
  reason: ReportReasonEnum,
  description: z.string().max(1000).optional(),
});

export const forumRouter = router({
  // Get all discussions with pagination and filtering
  getDiscussions: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          category: ForumCategoryEnum.optional(),
          search: z.string().optional(),
          bookTitle: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const category = input?.category;
      const search = input?.search;
      const bookTitle = input?.bookTitle;

      const where: {
        category?: typeof category;
        bookTitle?: { contains: string; mode: 'insensitive' };
        OR?: Array<{
          title?: { contains: string; mode: 'insensitive' };
          content?: { contains: string; mode: 'insensitive' };
          bookTitle?: { contains: string; mode: 'insensitive' };
          bookAuthor?: { contains: string; mode: 'insensitive' };
        }>;
      } = {};

      if (category) {
        where.category = category;
      }

      if (bookTitle) {
        where.bookTitle = { contains: bookTitle, mode: 'insensitive' };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { bookTitle: { contains: search, mode: 'insensitive' } },
          { bookAuthor: { contains: search, mode: 'insensitive' } },
        ];
      }

      const discussions = await prisma.forumDiscussion.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
          reactions: {
            select: {
              type: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (discussions.length > limit) {
        const nextItem = discussions.pop();
        nextCursor = nextItem?.id;
      }

      // Calculate reaction counts
      const discussionsWithReactionCounts = discussions.map(discussion => {
        const reactionCounts = discussion.reactions.reduce((acc, reaction) => {
          acc[reaction.type] = (acc[reaction.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...discussion,
          reactionCounts,
          reactions: undefined, // Remove raw reactions
        };
      });

      return {
        discussions: discussionsWithReactionCounts,
        nextCursor,
      };
    }),

  // Get a single discussion by ID
  getDiscussionById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const discussion = await prisma.forumDiscussion.findUnique({
        where: { id: input.id },
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              _count: {
                select: {
                  reactions: true,
                },
              },
              reactions: {
                select: {
                  type: true,
                  userId: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
          reactions: {
            select: {
              type: true,
              userId: true,
            },
          },
        },
      });

      if (!discussion) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Discussion not found',
        });
      }

      // Increment view count
      await prisma.forumDiscussion.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      // Calculate reaction counts for discussion
      const discussionReactionCounts = discussion.reactions.reduce(
        (acc, reaction) => {
          acc[reaction.type] = (acc[reaction.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Calculate reaction counts for each reply
      const repliesWithReactionCounts = discussion.replies.map(reply => {
        const replyReactionCounts = reply.reactions.reduce((acc, reaction) => {
          acc[reaction.type] = (acc[reaction.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...reply,
          reactionCounts: replyReactionCounts,
        };
      });

      return {
        ...discussion,
        reactionCounts: discussionReactionCounts,
        replies: repliesWithReactionCounts,
      };
    }),

  // Create a new discussion
  createDiscussion: protectedProcedure
    .input(createDiscussionSchema)
    .mutation(async ({ ctx, input }) => {
      // Content moderation check
      if (
        containsAbusiveContent(input.title) ||
        containsAbusiveContent(input.content)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Your content contains inappropriate language. Please revise and try again.',
        });
      }

      const authorName = input.isAnonymous
        ? generateAnonymousName()
        : ctx.session.user.name;

      const discussion = await prisma.forumDiscussion.create({
        data: {
          title: input.title,
          content: input.content,
          category: input.category,
          bookTitle: input.bookTitle,
          bookAuthor: input.bookAuthor,
          chapter: input.chapter,
          authorId: ctx.session.user.id,
          authorName,
          isAnonymous: input.isAnonymous,
        },
      });

      return discussion;
    }),

  // Create a reply to a discussion
  createReply: protectedProcedure
    .input(createReplySchema)
    .mutation(async ({ ctx, input }) => {
      // Check if discussion exists and is not locked
      const discussion = await prisma.forumDiscussion.findUnique({
        where: { id: input.discussionId },
      });

      if (!discussion) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Discussion not found',
        });
      }

      if (discussion.isLocked) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This discussion is locked and no longer accepts replies',
        });
      }

      // Content moderation check
      if (containsAbusiveContent(input.content)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Your content contains inappropriate language. Please revise and try again.',
        });
      }

      const authorName = input.isAnonymous
        ? generateAnonymousName()
        : ctx.session.user.name;

      const reply = await prisma.forumReply.create({
        data: {
          content: input.content,
          discussionId: input.discussionId,
          authorId: ctx.session.user.id,
          authorName,
          isAnonymous: input.isAnonymous,
          parentId: input.parentId,
        },
      });

      return reply;
    }),

  // Edit a discussion (only by author)
  editDiscussion: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5).max(200).optional(),
        content: z.string().min(20).max(10000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const discussion = await prisma.forumDiscussion.findUnique({
        where: { id: input.id },
      });

      if (!discussion) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Discussion not found',
        });
      }

      if (discussion.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only edit your own discussions',
        });
      }

      // Content moderation check
      if (
        (input.title && containsAbusiveContent(input.title)) ||
        (input.content && containsAbusiveContent(input.content))
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Your content contains inappropriate language. Please revise and try again.',
        });
      }

      const updated = await prisma.forumDiscussion.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
        },
      });

      return updated;
    }),

  // Edit a reply (only by author)
  editReply: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(5).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reply = await prisma.forumReply.findUnique({
        where: { id: input.id },
      });

      if (!reply) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reply not found',
        });
      }

      if (reply.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only edit your own replies',
        });
      }

      // Content moderation check
      if (containsAbusiveContent(input.content)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Your content contains inappropriate language. Please revise and try again.',
        });
      }

      const updated = await prisma.forumReply.update({
        where: { id: input.id },
        data: {
          content: input.content,
          isEdited: true,
        },
      });

      return updated;
    }),

  // Delete a discussion (only by author)
  deleteDiscussion: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const discussion = await prisma.forumDiscussion.findUnique({
        where: { id: input.id },
      });

      if (!discussion) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Discussion not found',
        });
      }

      if (discussion.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own discussions',
        });
      }

      await prisma.forumDiscussion.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Delete a reply (only by author)
  deleteReply: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reply = await prisma.forumReply.findUnique({
        where: { id: input.id },
      });

      if (!reply) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reply not found',
        });
      }

      if (reply.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own replies',
        });
      }

      await prisma.forumReply.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle reaction on discussion or reply
  toggleReaction: protectedProcedure
    .input(
      z.object({
        discussionId: z.string().optional(),
        replyId: z.string().optional(),
        type: ReactionTypeEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.discussionId && !input.replyId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either discussionId or replyId must be provided',
        });
      }

      const userId = ctx.session.user.id;

      // Check if reaction already exists
      const existingReaction = await prisma.forumReaction.findFirst({
        where: {
          userId,
          discussionId: input.discussionId || undefined,
          replyId: input.replyId || undefined,
          type: input.type,
        },
      });

      if (existingReaction) {
        // Remove reaction
        await prisma.forumReaction.delete({
          where: { id: existingReaction.id },
        });
        return { action: 'removed' };
      } else {
        // Add reaction
        await prisma.forumReaction.create({
          data: {
            type: input.type,
            userId,
            discussionId: input.discussionId,
            replyId: input.replyId,
          },
        });
        return { action: 'added' };
      }
    }),

  // Get user's reactions for a discussion (to show active states)
  getUserReactions: protectedProcedure
    .input(z.object({ discussionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reactions = await prisma.forumReaction.findMany({
        where: {
          userId: ctx.session.user.id,
          OR: [
            { discussionId: input.discussionId },
            {
              reply: {
                discussionId: input.discussionId,
              },
            },
          ],
        },
        select: {
          type: true,
          discussionId: true,
          replyId: true,
        },
      });

      return reactions;
    }),

  // Report content
  reportContent: protectedProcedure
    .input(reportContentSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.discussionId && !input.replyId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either discussionId or replyId must be provided',
        });
      }

      // Check if user already reported this content
      const existingReport = await prisma.forumReport.findFirst({
        where: {
          reporterId: ctx.session.user.id,
          discussionId: input.discussionId || undefined,
          replyId: input.replyId || undefined,
        },
      });

      if (existingReport) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already reported this content',
        });
      }

      const report = await prisma.forumReport.create({
        data: {
          reason: input.reason,
          description: input.description,
          reporterId: ctx.session.user.id,
          discussionId: input.discussionId,
          replyId: input.replyId,
        },
      });

      return report;
    }),

  // Get category stats (for sidebar)
  getCategoryStats: publicProcedure.query(async () => {
    const stats = await prisma.forumDiscussion.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    const categoryMap: Record<string, number> = {};
    stats.forEach(stat => {
      categoryMap[stat.category] = stat._count.category;
    });

    return categoryMap;
  }),

  // Get user's discussions
  getMyDiscussions: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const discussions = await prisma.forumDiscussion.findMany({
        where: { authorId: ctx.session.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (discussions.length > limit) {
        const nextItem = discussions.pop();
        nextCursor = nextItem?.id;
      }

      return {
        discussions,
        nextCursor,
      };
    }),

  // Get trending discussions (most reactions/replies in last 7 days)
  getTrending: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 5;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const discussions = await prisma.forumDiscussion.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
        },
        orderBy: [
          {
            reactions: {
              _count: 'desc',
            },
          },
          {
            replies: {
              _count: 'desc',
            },
          },
        ],
        take: limit,
      });

      return discussions;
    }),
});
