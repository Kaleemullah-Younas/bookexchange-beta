'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';
import {
  subscribeToUserChannel,
  BookRequestNotification,
  RequestUpdateNotification,
  NewChatMessageNotification,
} from '@/lib/pusher-client';

interface Notification {
  id: string;
  type: 'book-request' | 'request-update' | 'new-message';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string; // Changed to string for JSON serialization
}

const NOTIFICATIONS_STORAGE_KEY = 'bookexchange_notifications';

export function NotificationDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      } catch (error) {
        console.error('Failed to save notifications to storage:', error);
      }
    }
  }, [notifications, isInitialized]);

  // Get request counts for initial badge
  const { data: counts } = trpc.exchange.getRequestCounts.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingCount =
    (counts?.pendingIncoming ?? 0) + (counts?.acceptedIncoming ?? 0);
  const badgeCount = unreadCount || pendingCount;

  // Subscribe to Pusher for real-time notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const unsubscribe = subscribeToUserChannel(
      session.user.id,
      (data: BookRequestNotification) => {
        const newNotification: Notification = {
          id: data.requestId,
          type: 'book-request',
          title: 'New Book Request',
          message: `${data.requesterName} wants "${data.bookTitle}" for ${data.pointsOffered} points`,
          link: '/requests',
          read: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        utils.exchange.getRequestCounts.invalidate();
      },
      (data: RequestUpdateNotification) => {
        const statusMessages = {
          ACCEPTED: `Your request for "${data.bookTitle}" was accepted!`,
          DECLINED: `Your request for "${data.bookTitle}" was declined`,
          COMPLETED: `Exchange complete! "${data.bookTitle}" is now yours!`,
        };
        const newNotification: Notification = {
          id: data.requestId,
          type: 'request-update',
          title:
            data.status === 'COMPLETED'
              ? 'Exchange Complete!'
              : 'Request Update',
          message: statusMessages[data.status],
          link: '/requests',
          read: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        utils.exchange.getRequestCounts.invalidate();
        utils.exchange.getUserPoints.invalidate();
      },
      // New chat message notification
      (data: NewChatMessageNotification) => {
        const newNotification: Notification = {
          id: `chat-${data.conversationId}-${Date.now()}`,
          type: 'new-message',
          title: 'New Message',
          message: `${data.senderName}: ${data.preview}...`,
          link: `/chat?conversationId=${data.conversationId}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 10));
      }
    );

    return unsubscribe;
  }, [session?.user?.id, utils]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
    );
    setIsOpen(false);
    router.push(notification.link);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={markAllRead}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mark all read
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                {pendingCount > 0 && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/requests');
                    }}
                    className="mt-3 text-sm text-accent hover:underline"
                  >
                    View {pendingCount} pending request
                    {pendingCount > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 text-left border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${!notification.read ? 'bg-accent/5' : ''
                    }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'book-request'
                        ? 'bg-accent/10 text-accent'
                        : notification.type === 'new-message'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-green-500/10 text-green-500'
                        }`}
                    >
                      {notification.type === 'book-request' ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      ) : notification.type === 'new-message' ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {(notifications.length > 0 || pendingCount > 0) && (
            <div className="px-4 py-3 border-t border-border bg-secondary/30">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/requests');
                }}
                className="w-full text-sm text-center text-accent hover:underline font-medium"
              >
                View all requests
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
