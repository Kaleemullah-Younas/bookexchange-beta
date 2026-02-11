'use client';

import PusherClient from 'pusher-js';

// Client-side Pusher instance (singleton)
let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClient;
}

// Hook to subscribe to user-specific notifications
export function subscribeToUserChannel(
  userId: string,
  onBookRequest: (data: BookRequestNotification) => void,
  onRequestUpdate: (data: RequestUpdateNotification) => void,
  onNewChatMessage?: (data: NewChatMessageNotification) => void
) {
  const client = getPusherClient();
  const channel = client.subscribe(`user-${userId}`);

  channel.bind('book-request', onBookRequest);
  channel.bind('request-update', onRequestUpdate);
  if (onNewChatMessage) {
    channel.bind('new-message', onNewChatMessage);
  }

  return () => {
    channel.unbind('book-request', onBookRequest);
    channel.unbind('request-update', onRequestUpdate);
    if (onNewChatMessage) {
      channel.unbind('new-message', onNewChatMessage);
    }
    client.unsubscribe(`user-${userId}`);
  };
}

// Subscribe to conversation messages
export function subscribeToConversation(
  conversationId: string,
  onMessage: (data: ChatMessageNotification) => void
) {
  const client = getPusherClient();
  const channel = client.subscribe(conversationId);

  channel.bind('new-message', onMessage);

  return () => {
    channel.unbind('new-message', onMessage);
    client.unsubscribe(conversationId);
  };
}

export interface BookRequestNotification {
  requestId: string;
  bookId: string;
  bookTitle: string;
  requesterName: string;
  requesterId: string;
  pointsOffered: number;
  message?: string;
}

export interface RequestUpdateNotification {
  requestId: string;
  bookTitle: string;
  status: 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  ownerName: string;
}

export interface ChatMessageNotification {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage?: string | null;
  conversationId: string;
  createdAt: string;
}

// Notification sent to user channel when they receive a new chat message
export interface NewChatMessageNotification {
  type: 'new-message';
  conversationId: string;
  bookTitle: string;
  senderName: string;
  preview: string;
}

