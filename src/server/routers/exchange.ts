import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { sendNotification } from '@/lib/pusher';

// Book condition multipliers for point calculation
const CONDITION_MULTIPLIERS: Record<string, number> = {
  NEW: 1.5,
  LIKE_NEW: 1.3,
  VERY_GOOD: 1.1,
  GOOD: 1.0,
  ACCEPTABLE: 0.7,
};

// Base points for different book categories (can be expanded)
const BASE_POINTS = 50;

// Rarity factors based on how many copies exist in the system
const getRarityMultiplier = (copiesInSystem: number): number => {
  if (copiesInSystem === 1) return 1.5; // Unique - very rare
  if (copiesInSystem <= 3) return 1.3; // Rare
  if (copiesInSystem <= 5) return 1.15; // Uncommon
  if (copiesInSystem <= 10) return 1.0; // Common
  return 0.85; // Very common
};

// Demand factor based on requests
const getDemandMultiplier = (requestCount: number): number => {
  if (requestCount >= 10) return 1.5; // Very high demand
  if (requestCount >= 5) return 1.3; // High demand
  if (requestCount >= 3) return 1.15; // Moderate demand
  if (requestCount >= 1) return 1.05; // Some demand
  return 1.0; // No current demand
};

/**
 * AI-powered book valuation algorithm
 * Calculates point value based on condition, demand, and rarity
 */
async function calculateBookValue(
  bookId: string,
  condition: string,
  title: string,
  author: string
): Promise<{ points: number; breakdown: BookValueBreakdown }> {
  // Get condition multiplier
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition] || 1.0;

  // Calculate rarity - how many books with same title/author exist
  const similarBooks = await prisma.book.count({
    where: {
      title: { contains: title, mode: 'insensitive' },
      author: { contains: author, mode: 'insensitive' },
      isAvailable: true,
    },
  });
  const rarityMultiplier = getRarityMultiplier(similarBooks);

  // Calculate demand - how many pending requests for similar books
  const demandCount = await prisma.bookRequest.count({
    where: {
      book: {
        title: { contains: title, mode: 'insensitive' },
        author: { contains: author, mode: 'insensitive' },
      },
      status: 'PENDING',
    },
  });
  const demandMultiplier = getDemandMultiplier(demandCount);

  // Calculate final points
  const rawPoints =
    BASE_POINTS * conditionMultiplier * rarityMultiplier * demandMultiplier;
  const finalPoints = Math.round(rawPoints);

  return {
    points: finalPoints,
    breakdown: {
      basePoints: BASE_POINTS,
      conditionMultiplier,
      conditionLabel: condition,
      rarityMultiplier,
      copiesInSystem: similarBooks,
      demandMultiplier,
      pendingRequests: demandCount,
      finalPoints,
    },
  };
}

interface BookValueBreakdown {
  basePoints: number;
  conditionMultiplier: number;
  conditionLabel: string;
  rarityMultiplier: number;
  copiesInSystem: number;
  demandMultiplier: number;
  pendingRequests: number;
  finalPoints: number;
}

export const exchangeRouter = router({
  // Check if user has already requested a specific book
  hasUserRequestedBook: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existingRequest = await prisma.bookRequest.findFirst({
        where: {
          bookId: input.bookId,
          requesterId: ctx.session.user.id,
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
        select: {
          id: true,
          status: true,
        },
      });

      return {
        hasRequested: !!existingRequest,
        requestStatus: existingRequest?.status ?? null,
        requestId: existingRequest?.id ?? null,
      };
    }),

  // Get user's current points and stats
  getUserPoints: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { points: true },
    });

    // Get transaction stats
    // Only count EARNED_LISTING and EARNED_EXCHANGE as "earned" points
    // BONUS (purchased points) should not be included in totalEarned
    const [earnedTotal, spentTotal, transactionCount] = await Promise.all([
      prisma.pointTransaction.aggregate({
        where: {
          userId: ctx.session.user.id,
          amount: { gt: 0 },
          type: { in: ['EARNED_LISTING', 'EARNED_EXCHANGE'] },
        },
        _sum: { amount: true },
      }),
      prisma.pointTransaction.aggregate({
        where: { userId: ctx.session.user.id, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.pointTransaction.count({ where: { userId: ctx.session.user.id } }),
    ]);

    return {
      currentPoints: user?.points ?? 0,
      totalEarned: earnedTotal._sum.amount ?? 0,
      totalSpent: Math.abs(spentTotal._sum.amount ?? 0),
      transactionCount,
    };
  }),

  // Get transaction history
  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const transactions = await prisma.pointTransaction.findMany({
        where: { userId: ctx.session.user.id },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined;
      if (transactions.length > input.limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem?.id;
      }

      return { transactions, nextCursor };
    }),

  // Calculate book value (AI-powered)
  getBookValue: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input }) => {
      const book = await prisma.book.findUnique({
        where: { id: input.bookId },
        select: {
          id: true,
          title: true,
          author: true,
          condition: true,
          pointValue: true,
        },
      });

      if (!book) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Book not found' });
      }

      const { points, breakdown } = await calculateBookValue(
        book.id,
        book.condition,
        book.title,
        book.author
      );

      // Update stored point value if changed
      if (book.pointValue !== points) {
        await prisma.book.update({
          where: { id: book.id },
          data: { pointValue: points },
        });
      }

      return { points, breakdown };
    }),

  // Request a book exchange
  requestBook: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        message: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the book details
      const book = await prisma.book.findUnique({
        where: { id: input.bookId },
        include: { owner: { select: { id: true, name: true } } },
      });

      if (!book) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Book not found' });
      }

      if (!book.isAvailable) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This book is not available for exchange',
        });
      }

      if (book.ownerId === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot request your own book',
        });
      }

      // Check if user already has a pending request for this book
      const existingRequest = await prisma.bookRequest.findFirst({
        where: {
          bookId: input.bookId,
          requesterId: ctx.session.user.id,
          status: 'PENDING',
        },
      });

      if (existingRequest) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have a pending request for this book',
        });
      }

      // ANTI-FARMING: Check for circular exchange patterns
      // Prevent requesting a book that was previously owned by the requester
      // and exchanged to the current owner (would allow point farming)
      const circularExchange = await prisma.bookRequest.findFirst({
        where: {
          bookId: input.bookId,
          status: 'COMPLETED',
          // The current owner previously requested this book FROM the current requester
          requesterId: book.ownerId,
          ownerId: ctx.session.user.id,
        },
      });

      if (circularExchange) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Circular exchange detected. You cannot request a book you previously gave to this user. This prevents point farming.',
        });
      }

      // Also check if the requester ever owned this specific book (by digitalId)
      // to prevent farming through chains of users
      const previousOwnership = await prisma.bookRequest.findFirst({
        where: {
          book: { digitalId: book.digitalId },
          status: 'COMPLETED',
          requesterId: ctx.session.user.id, // User previously received this book
        },
      });

      if (previousOwnership) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You have previously owned this book. To maintain fair exchange, you cannot request a book you once owned.',
        });
      }

      // Calculate book value
      const { points } = await calculateBookValue(
        book.id,
        book.condition,
        book.title,
        book.author
      );

      // Check if user has enough points
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { points: true },
      });

      if (!user || user.points < points) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient points. You need ${points} points but only have ${
            user?.points ?? 0
          }`,
        });
      }

      // Create request and deduct points in a transaction
      const [request] = await prisma.$transaction([
        prisma.bookRequest.create({
          data: {
            bookId: input.bookId,
            requesterId: ctx.session.user.id,
            ownerId: book.ownerId,
            pointsOffered: points,
            message: input.message,
          },
        }),
        prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { points: { decrement: points } },
        }),
        prisma.pointTransaction.create({
          data: {
            userId: ctx.session.user.id,
            amount: -points,
            type: 'SPENT_REQUEST',
            description: `Requested "${book.title}" by ${book.author}`,
            bookId: book.id,
          },
        }),
      ]);

      // Get requester name for notification
      const requester = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { name: true },
      });

      // Send Pusher notification to book owner
      await sendNotification(book.ownerId, 'book-request', {
        requestId: request.id,
        bookId: book.id,
        bookTitle: book.title,
        requesterName: requester?.name ?? 'Someone',
        requesterId: ctx.session.user.id,
        pointsOffered: points,
        message: input.message,
      });

      return {
        request,
        pointsSpent: points,
        message: `Request sent! ${points} points have been reserved.`,
      };
    }),

  // Accept a book request (owner action)
  acceptRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.bookRequest.findUnique({
        where: { id: input.requestId },
        include: {
          book: true,
          requester: { select: { id: true, name: true } },
        },
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (request.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the book owner can accept requests',
        });
      }

      if (request.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This request has already been processed',
        });
      }

      // Accept request - points transfer happens on completion
      await prisma.bookRequest.update({
        where: { id: input.requestId },
        data: { status: 'ACCEPTED' },
      });

      // Decline all other pending requests for this book
      await prisma.bookRequest.updateMany({
        where: {
          bookId: request.bookId,
          id: { not: input.requestId },
          status: 'PENDING',
        },
        data: { status: 'DECLINED' },
      });

      // Refund points for declined requests
      const declinedRequests = await prisma.bookRequest.findMany({
        where: {
          bookId: request.bookId,
          id: { not: input.requestId },
          status: 'DECLINED',
        },
      });

      for (const declined of declinedRequests) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: declined.requesterId },
            data: { points: { increment: declined.pointsOffered } },
          }),
          prisma.pointTransaction.create({
            data: {
              userId: declined.requesterId,
              amount: declined.pointsOffered,
              type: 'REFUND',
              description: `Refund for "${request.book.title}" - another request accepted`,
              bookId: request.bookId,
            },
          }),
        ]);

        // Notify declined requester
        await sendNotification(declined.requesterId, 'request-update', {
          requestId: declined.id,
          bookTitle: request.book.title,
          status: 'DECLINED',
          ownerName: ctx.session.user.name ?? 'Owner',
        });
      }

      // Get owner name for notification
      const owner = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { name: true },
      });

      // Notify the accepted requester
      await sendNotification(request.requesterId, 'request-update', {
        requestId: request.id,
        bookTitle: request.book.title,
        status: 'ACCEPTED',
        ownerName: owner?.name ?? 'Owner',
      });

      return { success: true, message: 'Request accepted!' };
    }),

  // Complete the exchange (owner confirms handover)
  completeExchange: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.bookRequest.findUnique({
        where: { id: input.requestId },
        include: { book: true },
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (request.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the book owner can complete exchanges',
        });
      }

      if (request.status !== 'ACCEPTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This request must be accepted first',
        });
      }

      // Complete exchange in transaction
      const [, , updatedOwner] = await prisma.$transaction([
        // Update request status
        prisma.bookRequest.update({
          where: { id: input.requestId },
          data: { status: 'COMPLETED' },
        }),
        // Transfer book ownership - keep book available with new owner
        prisma.book.update({
          where: { id: request.bookId },
          data: {
            ownerId: request.requesterId,
            isAvailable: true, // Book stays available with new owner
          },
        }),
        // Give points to original owner (the one giving away the book)
        prisma.user.update({
          where: { id: request.ownerId },
          data: { points: { increment: request.pointsOffered } },
        }),
        // Record transaction for owner who gave the book
        prisma.pointTransaction.create({
          data: {
            userId: request.ownerId,
            amount: request.pointsOffered,
            type: 'EARNED_EXCHANGE',
            description: `Exchanged "${request.book.title}"`,
            bookId: request.bookId,
          },
        }),
      ]);

      // Get owner name for notification
      const owner = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { name: true },
      });

      // Notify the requester that exchange is complete
      await sendNotification(request.requesterId, 'request-update', {
        requestId: request.id,
        bookTitle: request.book.title,
        status: 'COMPLETED',
        ownerName: owner?.name ?? 'Owner',
      });

      return {
        success: true,
        pointsEarned: request.pointsOffered,
        message: `Exchange completed! You earned ${request.pointsOffered} points.`,
      };
    }),

  // Decline a request (owner action)
  declineRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.bookRequest.findUnique({
        where: { id: input.requestId },
        include: { book: true },
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (request.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the book owner can decline requests',
        });
      }

      if (request.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This request has already been processed',
        });
      }

      // Decline and refund
      await prisma.$transaction([
        prisma.bookRequest.update({
          where: { id: input.requestId },
          data: { status: 'DECLINED' },
        }),
        prisma.user.update({
          where: { id: request.requesterId },
          data: { points: { increment: request.pointsOffered } },
        }),
        prisma.pointTransaction.create({
          data: {
            userId: request.requesterId,
            amount: request.pointsOffered,
            type: 'REFUND',
            description: `Refund for "${request.book.title}" - request declined`,
            bookId: request.bookId,
          },
        }),
      ]);

      return { success: true, message: 'Request declined and points refunded' };
    }),

  // Cancel own request (requester action)
  cancelRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await prisma.bookRequest.findUnique({
        where: { id: input.requestId },
        include: { book: true },
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (request.requesterId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only cancel your own requests',
        });
      }

      if (request.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending requests can be cancelled',
        });
      }

      // Cancel and refund
      await prisma.$transaction([
        prisma.bookRequest.update({
          where: { id: input.requestId },
          data: { status: 'CANCELLED' },
        }),
        prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { points: { increment: request.pointsOffered } },
        }),
        prisma.pointTransaction.create({
          data: {
            userId: ctx.session.user.id,
            amount: request.pointsOffered,
            type: 'REFUND',
            description: `Cancelled request for "${request.book.title}"`,
            bookId: request.bookId,
          },
        }),
      ]);

      return {
        success: true,
        message: 'Request cancelled and points refunded',
      };
    }),

  // Get incoming requests (for book owners)
  getIncomingRequests: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(['PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED', 'CANCELLED'])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const requests = await prisma.bookRequest.findMany({
        where: {
          ownerId: ctx.session.user.id,
          ...(input.status && { status: input.status }),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              images: true,
              condition: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return requests;
    }),

  // Get outgoing requests (for requesters)
  getOutgoingRequests: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(['PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED', 'CANCELLED'])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const requests = await prisma.bookRequest.findMany({
        where: {
          requesterId: ctx.session.user.id,
          ...(input.status && { status: input.status }),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              images: true,
              condition: true,
              location: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return requests;
    }),

  // Get request counts for badges
  getRequestCounts: protectedProcedure.query(async ({ ctx }) => {
    const [pendingIncoming, pendingOutgoing, acceptedIncoming] =
      await Promise.all([
        prisma.bookRequest.count({
          where: { ownerId: ctx.session.user.id, status: 'PENDING' },
        }),
        prisma.bookRequest.count({
          where: { requesterId: ctx.session.user.id, status: 'PENDING' },
        }),
        prisma.bookRequest.count({
          where: { ownerId: ctx.session.user.id, status: 'ACCEPTED' },
        }),
      ]);

    return { pendingIncoming, pendingOutgoing, acceptedIncoming };
  }),
});
