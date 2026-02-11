import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';

// Zod schemas for validation
const addHistoryEntrySchema = z.object({
  bookDigitalId: z.string().min(1, 'Book ID is required'),
  city: z.string().min(1, 'City is required').max(100),
  country: z.string().max(100).optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z
    .string()
    .transform(str => new Date(str))
    .optional(),
  note: z.string().max(500).optional(),
  tip: z.string().max(300).optional(),
  rating: z.number().min(1).max(5).optional(),
  isAnonymous: z.boolean().default(false),
});

const updateHistoryEntrySchema = z.object({
  id: z.string(),
  city: z.string().min(1).max(100).optional(),
  country: z.string().max(100).optional(),
  startDate: z
    .string()
    .transform(str => new Date(str))
    .optional(),
  endDate: z
    .string()
    .transform(str => new Date(str))
    .optional(),
  note: z.string().max(500).optional(),
  tip: z.string().max(300).optional(),
  rating: z.number().min(1).max(5).optional(),
  isAnonymous: z.boolean().optional(),
});

export const bookHistoryRouter = router({
  // Get book history by digital ID (public - anyone who scans QR can see)
  getByDigitalId: publicProcedure
    .input(z.object({ digitalId: z.string() }))
    .query(async ({ input }) => {
      // First verify the book exists
      const book = await prisma.book.findUnique({
        where: { digitalId: input.digitalId },
        select: {
          id: true,
          digitalId: true,
          title: true,
          author: true,
          images: true,
          condition: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found with this QR code',
        });
      }

      // Get all history entries for this book
      const historyEntries = await prisma.bookHistoryEntry.findMany({
        where: { bookDigitalId: input.digitalId },
        orderBy: { startDate: 'desc' },
      });

      // Calculate stats
      const totalReaders = historyEntries.length;
      const totalCities = new Set(historyEntries.map(e => e.city)).size;
      const totalCountries = new Set(
        historyEntries.filter(e => e.country).map(e => e.country)
      ).size;
      const averageRating =
        historyEntries.filter(e => e.rating).length > 0
          ? historyEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
            historyEntries.filter(e => e.rating).length
          : null;

      // Map entries for display (hide reader info if anonymous)
      const entries = historyEntries.map(entry => ({
        id: entry.id,
        readerName: entry.isAnonymous ? 'Anonymous Reader' : entry.readerName,
        readerAvatar: entry.isAnonymous ? null : entry.readerAvatar,
        city: entry.city,
        country: entry.country,
        startDate: entry.startDate,
        endDate: entry.endDate,
        durationDays: entry.durationDays,
        note: entry.note,
        tip: entry.tip,
        rating: entry.rating,
        isAnonymous: entry.isAnonymous,
        createdAt: entry.createdAt,
      }));

      return {
        book,
        stats: {
          totalReaders,
          totalCities,
          totalCountries,
          averageRating,
        },
        entries,
      };
    }),

  // Add a new history entry (protected - requires login)
  addEntry: protectedProcedure
    .input(addHistoryEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the book exists
      const book = await prisma.book.findUnique({
        where: { digitalId: input.bookDigitalId },
      });

      if (!book) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Book not found',
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, name: true, image: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Calculate duration if end date provided
      let durationDays: number | null = null;
      if (input.endDate) {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        durationDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Create the history entry
      const entry = await prisma.bookHistoryEntry.create({
        data: {
          bookDigitalId: input.bookDigitalId,
          readerId: user.id,
          readerName: user.name,
          readerAvatar: user.image,
          city: input.city,
          country: input.country,
          startDate: input.startDate,
          endDate: input.endDate,
          durationDays,
          note: input.note,
          tip: input.tip,
          rating: input.rating,
          isAnonymous: input.isAnonymous,
        },
      });

      return entry;
    }),

  // Update own history entry
  updateEntry: protectedProcedure
    .input(updateHistoryEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Find the entry
      const entry = await prisma.bookHistoryEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'History entry not found',
        });
      }

      // Check ownership
      if (entry.readerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only edit your own entries',
        });
      }

      // Recalculate duration if dates changed
      let durationDays = entry.durationDays;
      if (updateData.startDate || updateData.endDate) {
        const start = updateData.startDate || entry.startDate;
        const end = updateData.endDate || entry.endDate;
        if (end) {
          durationDays = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      }

      // Update the entry
      const updated = await prisma.bookHistoryEntry.update({
        where: { id },
        data: {
          ...updateData,
          durationDays,
        },
      });

      return updated;
    }),

  // Delete own history entry
  deleteEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await prisma.bookHistoryEntry.findUnique({
        where: { id: input.id },
      });

      if (!entry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'History entry not found',
        });
      }

      if (entry.readerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own entries',
        });
      }

      await prisma.bookHistoryEntry.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get user's own history entries
  getMyEntries: protectedProcedure
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

      const entries = await prisma.bookHistoryEntry.findMany({
        where: { readerId: ctx.session.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      // Get book info for each entry
      const entriesWithBooks = await Promise.all(
        entries.slice(0, limit).map(async entry => {
          const book = await prisma.book.findUnique({
            where: { digitalId: entry.bookDigitalId },
            select: {
              id: true,
              title: true,
              author: true,
              images: true,
            },
          });
          return { ...entry, book };
        })
      );

      let nextCursor: string | undefined = undefined;
      if (entries.length > limit) {
        nextCursor = entries[limit].id;
      }

      return {
        entries: entriesWithBooks,
        nextCursor,
      };
    }),

  // Check if user has already added an entry for this book
  hasUserAddedEntry: protectedProcedure
    .input(z.object({ digitalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const entry = await prisma.bookHistoryEntry.findFirst({
        where: {
          bookDigitalId: input.digitalId,
          readerId: ctx.session.user.id,
        },
      });

      return {
        hasEntry: !!entry,
        entry: entry,
      };
    }),
});
