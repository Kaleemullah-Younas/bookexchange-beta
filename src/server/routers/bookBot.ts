import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { generateBookBotResponse } from '@/lib/gemini';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const bookBotRouter = router({
  // Send a message to BookBot (public - anyone can use)
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        conversationHistory: z.array(chatMessageSchema).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get available books for context
      const availableBooks = await prisma.book.findMany({
        where: { isAvailable: true },
        select: {
          id: true,
          title: true,
          author: true,
          condition: true,
          location: true,
          pointValue: true,
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      // Get user info if logged in
      let userPoints: number | undefined;
      let userName: string | undefined;

      if (ctx.session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { points: true, name: true },
        });
        if (user) {
          userPoints = user.points;
          userName = user.name;
        }
      }

      // Generate response
      const response = await generateBookBotResponse(
        input.message,
        input.conversationHistory,
        {
          availableBooks,
          userPoints,
          userName,
        }
      );

      return {
        message: response,
        timestamp: new Date().toISOString(),
      };
    }),

  // Get suggested questions/prompts
  getSuggestions: publicProcedure.query(async () => {
    return {
      suggestions: [
        'What books do you have available?',
        'How does the points system work?',
        'Recommend me a good fiction book',
        "What's the best condition book I can get?",
        'How do QR codes work on this platform?',
        'Find me books in good condition',
      ],
    };
  }),
});
