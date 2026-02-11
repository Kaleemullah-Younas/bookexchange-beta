import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { sendChatMessage } from '@/lib/pusher';

export const chatRouter = router({
    // Get or create a conversation for a book
    getOrCreateConversation: protectedProcedure
        .input(
            z.object({
                bookId: z.string(),
                ownerId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Can't chat with yourself
            if (userId === input.ownerId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: "You can't start a conversation with yourself",
                });
            }

            // Check if book exists
            const book = await prisma.book.findUnique({
                where: { id: input.bookId },
            });

            if (!book) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Book not found',
                });
            }

            // Try to find existing conversation
            let conversation = await prisma.conversation.findFirst({
                where: {
                    bookId: input.bookId,
                    OR: [
                        { participant1: userId, participant2: input.ownerId },
                        { participant1: input.ownerId, participant2: userId },
                    ],
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                        },
                    },
                },
            });

            // Create if doesn't exist
            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        bookId: input.bookId,
                        participant1: userId,
                        participant2: input.ownerId,
                    },
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                images: true,
                            },
                        },
                    },
                });
            }

            return conversation;
        }),

    // Get all conversations for the current user
    getConversations: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [{ participant1: userId }, { participant2: userId }],
            },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: [
                { lastMessageAt: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        // Get unread counts and other participant info for each conversation
        const conversationsWithMeta = await Promise.all(
            conversations.map(async conv => {
                const otherParticipantId =
                    conv.participant1 === userId ? conv.participant2 : conv.participant1;

                const otherParticipant = await prisma.user.findUnique({
                    where: { id: otherParticipantId },
                    select: { id: true, name: true, image: true },
                });

                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userId },
                        isRead: false,
                    },
                });

                return {
                    ...conv,
                    otherParticipant,
                    unreadCount,
                };
            })
        );

        return conversationsWithMeta;
    }),

    // Get messages for a conversation
    getMessages: protectedProcedure
        .input(
            z.object({
                conversationId: z.string(),
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { conversationId, limit, cursor } = input;

            // Verify user is part of the conversation
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    OR: [{ participant1: userId }, { participant2: userId }],
                },
            });

            if (!conversation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Conversation not found',
                });
            }

            const messages = await prisma.message.findMany({
                where: { conversationId },
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: 'desc' },
            });

            let nextCursor: string | undefined = undefined;
            if (messages.length > limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem?.id;
            }

            // Reverse to show oldest first
            return {
                messages: messages.reverse(),
                nextCursor,
            };
        }),

    // Send a message
    sendMessage: protectedProcedure
        .input(
            z.object({
                conversationId: z.string(),
                content: z.string().min(1).max(2000),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { conversationId, content } = input;

            // Verify user is part of the conversation
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    OR: [{ participant1: userId }, { participant2: userId }],
                },
                include: {
                    book: {
                        select: { title: true },
                    },
                },
            });

            if (!conversation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Conversation not found',
                });
            }

            // Get sender info
            const sender = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, image: true },
            });

            // Create message
            const message = await prisma.message.create({
                data: {
                    content,
                    senderId: userId,
                    conversationId,
                },
            });

            // Update conversation's last message
            await prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessage: content.substring(0, 100),
                    lastMessageAt: new Date(),
                },
            });

            // Determine recipient
            const recipientId =
                conversation.participant1 === userId
                    ? conversation.participant2
                    : conversation.participant1;

            // Send real-time notification via Pusher
            await sendChatMessage(conversationId, {
                id: message.id,
                content: message.content,
                senderId: userId,
                senderName: sender?.name || 'Unknown',
                senderImage: sender?.image,
                conversationId,
                createdAt: message.createdAt.toISOString(),
            });

            // Also notify the recipient about new message
            await sendChatMessage(`user-${recipientId}`, {
                type: 'new-message',
                conversationId,
                bookTitle: conversation.book.title,
                senderName: sender?.name || 'Unknown',
                preview: content.substring(0, 50),
            });

            return message;
        }),

    // Mark messages as read
    markAsRead: protectedProcedure
        .input(z.object({ conversationId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { conversationId } = input;

            // Verify user is part of the conversation
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    OR: [{ participant1: userId }, { participant2: userId }],
                },
            });

            if (!conversation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Conversation not found',
                });
            }

            // Mark all messages from other user as read
            await prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    isRead: false,
                },
                data: { isRead: true },
            });

            return { success: true };
        }),

    // Get single conversation by ID
    getConversation: protectedProcedure
        .input(z.object({ conversationId: z.string() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: input.conversationId,
                    OR: [{ participant1: userId }, { participant2: userId }],
                },
                include: {
                    book: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!conversation) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Conversation not found',
                });
            }

            const otherParticipantId =
                conversation.participant1 === userId
                    ? conversation.participant2
                    : conversation.participant1;

            const otherParticipant = await prisma.user.findUnique({
                where: { id: otherParticipantId },
                select: { id: true, name: true, image: true },
            });

            return {
                ...conversation,
                otherParticipant,
            };
        }),
});
