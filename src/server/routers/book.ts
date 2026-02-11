import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { generateBookRecommendations, estimateReadingTime } from '@/lib/gemini';

// Zod schemas for validation
const BookConditionEnum = z.enum([
  'NEW',
  'LIKE_NEW',
  'VERY_GOOD',
  'GOOD',
  'ACCEPTABLE',
]);

const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  description: z.string().max(2000).optional(),
  condition: BookConditionEnum,
  images: z
    .array(z.string().url())
    .min(1, 'At least one image is required')
    .max(5),
  location: z.string().min(1, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const updateBookSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  condition: BookConditionEnum.optional(),
  images: z.array(z.string().url()).min(1).max(5).optional(),
  location: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isAvailable: z.boolean().optional(),
});

export const bookRouter = router({
  // Get all available books (public)
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          condition: BookConditionEnum.optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;
      const condition = input?.condition;
      const search = input?.search;

      const where: {
        isAvailable: boolean;
        condition?: typeof condition;
        OR?: Array<{
          title?: { contains: string; mode: 'insensitive' };
          author?: { contains: string; mode: 'insensitive' };
          location?: { contains: string; mode: 'insensitive' };
          digitalId?: { contains: string; mode: 'insensitive' };
        }>;
      } = {
        isAvailable: true,
      };

      if (condition) {
        where.condition = condition;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { digitalId: { contains: search, mode: 'insensitive' } },
        ];
      }

      const books = await prisma.book.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (books.length > limit) {
        const nextItem = books.pop();
        nextCursor = nextItem?.id;
      }

      return {
        books,
        nextCursor,
      };
    }),

  // Get a single book by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const book = await prisma.book.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      return book;
    }),

  // Get book by digital ID (unique identifier)
  getByDigitalId: publicProcedure
    .input(z.object({ digitalId: z.string() }))
    .query(async ({ input }) => {
      const book = await prisma.book.findUnique({
        where: { digitalId: input.digitalId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      return book;
    }),

  // Get books by current user (protected)
  getMyBooks: protectedProcedure.query(async ({ ctx }) => {
    const books = await prisma.book.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return books;
  }),

  // Create a new book (protected)
  create: protectedProcedure
    .input(createBookSchema)
    .mutation(async ({ ctx, input }) => {
      // Listing bonus points
      const LISTING_BONUS = 10;

      // Import Gemini service dynamically to avoid top-level await issues
      const { generateBookPoints } = await import('@/lib/gemini');

      // First, get context for point calculation
      const [similarBooksCount, pendingRequestsCount] = await Promise.all([
        // Count similar books for rarity
        prisma.book.count({
          where: {
            title: { contains: input.title, mode: 'insensitive' },
            author: { contains: input.author, mode: 'insensitive' },
            isAvailable: true,
          },
        }),
        // Count pending requests for similar books for demand
        prisma.bookRequest.count({
          where: {
            book: {
              title: { contains: input.title, mode: 'insensitive' },
              author: { contains: input.author, mode: 'insensitive' },
            },
            status: 'PENDING',
          },
        }),
      ]);

      // Generate points using Gemini AI
      const pointValue = await generateBookPoints({
        title: input.title,
        author: input.author,
        condition: input.condition,
        similarBooksCount,
        pendingRequestsCount,
      });

      const [book] = await prisma.$transaction([
        prisma.book.create({
          data: {
            ...input,
            ownerId: ctx.session.user.id,
            pointValue, // Set AI-generated point value
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        }),
        // Award points for listing
        prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { points: { increment: LISTING_BONUS } },
        }),
        prisma.pointTransaction.create({
          data: {
            userId: ctx.session.user.id,
            amount: LISTING_BONUS,
            type: 'EARNED_LISTING',
            description: `Listed "${input.title}" for exchange`,
          },
        }),
      ]);

      return book;
    }),

  // Update a book (protected - only owner)
  update: protectedProcedure
    .input(updateBookSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check ownership
      const existingBook = await prisma.book.findUnique({
        where: { id },
      });

      if (!existingBook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      if (existingBook.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own books',
        });
      }

      const book = await prisma.book.update({
        where: { id },
        data,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return book;
    }),

  // Delete a book (protected - only owner)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const existingBook = await prisma.book.findUnique({
        where: { id: input.id },
      });

      if (!existingBook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      if (existingBook.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own books',
        });
      }

      await prisma.book.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle book availability (protected - only owner)
  toggleAvailability: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingBook = await prisma.book.findUnique({
        where: { id: input.id },
      });

      if (!existingBook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      if (existingBook.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only modify your own books',
        });
      }

      const book = await prisma.book.update({
        where: { id: input.id },
        data: { isAvailable: !existingBook.isAvailable },
      });

      return book;
    }),

  // Get AI-powered personalized book recommendations
  getRecommendations: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(12).default(6),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 6;
      const userId = ctx.session.user.id;

      // Get user's owned books
      const ownedBooks = await prisma.book.findMany({
        where: { ownerId: userId },
        select: { title: true, author: true },
      });

      // Get user's requested books
      const requestedBooks = await prisma.bookRequest.findMany({
        where: { requesterId: userId },
        select: {
          book: {
            select: { title: true, author: true },
          },
        },
      });

      // Get books from user's reading history
      const historyEntries = await prisma.bookHistoryEntry.findMany({
        where: { readerId: userId },
        select: { bookDigitalId: true },
      });

      // Get book details for history entries
      const historyBooks = await prisma.book.findMany({
        where: {
          digitalId: { in: historyEntries.map(h => h.bookDigitalId) },
        },
        select: { title: true, author: true },
      });

      // Get available books (excluding user's own books)
      const availableBooks = await prisma.book.findMany({
        where: {
          isAvailable: true,
          ownerId: { not: userId },
        },
        select: {
          id: true,
          title: true,
          author: true,
          condition: true,
          location: true,
          images: true,
          pointValue: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        take: 50, // Limit for AI processing
      });

      if (availableBooks.length === 0) {
        return { recommendations: [], isPersonalized: false };
      }

      // Prepare data for AI
      const userData = {
        ownedBooks: ownedBooks.map(b => ({ title: b.title, author: b.author })),
        requestedBooks: requestedBooks.map(r => ({
          title: r.book.title,
          author: r.book.author,
        })),
        historyBooks: historyBooks.map(b => ({
          title: b.title,
          author: b.author,
        })),
      };

      const booksForAI = availableBooks.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        condition: b.condition,
        location: b.location,
      }));

      // Get AI recommendations
      const aiRecommendations = await generateBookRecommendations(
        userData,
        booksForAI,
        limit
      );

      // If AI returned recommendations, map them to full book data
      if (aiRecommendations.length > 0) {
        const recommendedBooks = aiRecommendations
          .map(rec => {
            const book = availableBooks.find(b => b.id === rec.bookId);
            if (!book) return null;
            return {
              ...book,
              aiScore: rec.score,
              aiReason: rec.reason,
            };
          })
          .filter(Boolean);

        return {
          recommendations: recommendedBooks,
          isPersonalized: true,
        };
      }

      // Fallback: Return trending/recent books
      const trendingBooks = availableBooks.slice(0, limit).map(book => ({
        ...book,
        aiScore: null,
        aiReason: null,
      }));

      return {
        recommendations: trendingBooks,
        isPersonalized: false,
      };
    }),

  // Get trending books (for non-logged-in users)
  getTrending: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(12).default(6),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 6;

      // Get books with most requests (trending)
      const booksWithRequests = await prisma.book.findMany({
        where: { isAvailable: true },
        select: {
          id: true,
          title: true,
          author: true,
          condition: true,
          location: true,
          images: true,
          pointValue: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: { requests: true },
          },
        },
        orderBy: {
          requests: { _count: 'desc' },
        },
        take: limit,
      });

      return {
        books: booksWithRequests.map(b => ({
          ...b,
          requestCount: b._count.requests,
        })),
      };
    }),

  // Get reading time estimate for a book
  getReadingTimeEstimate: publicProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ input }) => {
      const book = await prisma.book.findUnique({
        where: { id: input.bookId },
        select: {
          title: true,
          author: true,
          description: true,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      const estimate = await estimateReadingTime({
        title: book.title,
        author: book.author,
        description: book.description,
      });

      return estimate;
    }),
});
