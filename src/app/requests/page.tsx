'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useSession } from '@/lib/auth-client';
import {
  subscribeToUserChannel,
  BookRequestNotification,
  RequestUpdateNotification,
} from '@/lib/pusher-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, BookOpen, Inbox, Send, Check, X, Info, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

type TabType = 'incoming' | 'outgoing';

export default function RequestsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('incoming');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const utils = trpc.useUtils();

  // Fetch incoming requests
  const { data: incomingRequests, isLoading: incomingLoading } =
    trpc.exchange.getIncomingRequests.useQuery(
      {},
      { enabled: !!session?.user }
    );

  // Fetch outgoing requests
  const { data: outgoingRequests, isLoading: outgoingLoading } =
    trpc.exchange.getOutgoingRequests.useQuery(
      {},
      { enabled: !!session?.user }
    );

  // Request counts
  const { data: counts } = trpc.exchange.getRequestCounts.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // Mutations
  const acceptRequest = trpc.exchange.acceptRequest.useMutation({
    onSuccess: () => {
      utils.exchange.getIncomingRequests.invalidate();
      utils.exchange.getRequestCounts.invalidate();
      utils.exchange.getUserPoints.invalidate();
      setNotification({
        type: 'success',
        message: 'Request accepted! You can now complete the exchange.',
      });
    },
    onError: error => {
      setNotification({ type: 'error', message: error.message });
    },
  });

  const completeExchange = trpc.exchange.completeExchange.useMutation({
    onSuccess: data => {
      utils.exchange.getIncomingRequests.invalidate();
      utils.exchange.getRequestCounts.invalidate();
      utils.exchange.getUserPoints.invalidate();
      setNotification({
        type: 'success',
        message: `Exchange completed! You earned ${data.pointsEarned} points.`,
      });
    },
    onError: error => {
      setNotification({ type: 'error', message: error.message });
    },
  });

  const declineRequest = trpc.exchange.declineRequest.useMutation({
    onSuccess: () => {
      utils.exchange.getIncomingRequests.invalidate();
      utils.exchange.getRequestCounts.invalidate();
      setNotification({
        type: 'info',
        message: 'Request declined. Points refunded to requester.',
      });
    },
    onError: error => {
      setNotification({ type: 'error', message: error.message });
    },
  });

  const cancelRequest = trpc.exchange.cancelRequest.useMutation({
    onSuccess: () => {
      utils.exchange.getOutgoingRequests.invalidate();
      utils.exchange.getRequestCounts.invalidate();
      utils.exchange.getUserPoints.invalidate();
      setNotification({
        type: 'info',
        message: 'Request cancelled. Points refunded.',
      });
    },
    onError: error => {
      setNotification({ type: 'error', message: error.message });
    },
  });

  // Pusher real-time notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const unsubscribe = subscribeToUserChannel(
      session.user.id,
      (data: BookRequestNotification) => {
        utils.exchange.getIncomingRequests.invalidate();
        utils.exchange.getRequestCounts.invalidate();
        setNotification({
          type: 'info',
          message: `${data.requesterName} wants to exchange "${data.bookTitle}" for ${data.pointsOffered} points!`,
        });
      },
      (data: RequestUpdateNotification) => {
        utils.exchange.getOutgoingRequests.invalidate();
        utils.exchange.getRequestCounts.invalidate();
        utils.exchange.getUserPoints.invalidate();
        const statusMessages = {
          ACCEPTED: `Great news! ${data.ownerName} accepted your request for "${data.bookTitle}"!`,
          DECLINED: `${data.ownerName} declined your request for "${data.bookTitle}". Points refunded.`,
          COMPLETED: `Exchange completed! "${data.bookTitle}" is now yours!`,
        };
        setNotification({
          type: data.status === 'DECLINED' ? 'error' : 'success',
          message: statusMessages[data.status],
        });
      }
    );

    return unsubscribe;
  }, [session?.user?.id, utils]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full bg-card border border-border p-8 rounded-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
          >
            <ArrowDownLeft className="w-8 h-8 text-accent" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your book exchange requests.
          </p>
          <Link href="/signin">
            <motion.div
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold cursor-pointer text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.div>
          </Link>
        </motion.div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      ACCEPTED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      DECLINED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      CANCELLED: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const tabs = [
    { id: 'incoming' as TabType, label: 'Incoming', icon: ArrowDownLeft, count: counts?.pendingIncoming },
    { id: 'outgoing' as TabType, label: 'My Requests', icon: ArrowUpRight, count: counts?.pendingOutgoing },
  ];

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={`px-5 py-4 rounded-xl shadow-lg border flex items-center gap-3 ${notification.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                  : notification.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                    : 'bg-accent/10 border-accent/20 text-accent'
                }`}
            >
              {notification.type === 'success' && <Check className="w-5 h-5" />}
              {notification.type === 'error' && <X className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
              <p className="font-medium text-sm">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
            className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center"
          >
            <ArrowDownLeft className="w-6 h-6 text-accent" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Exchange Requests
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your incoming and outgoing book requests
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'bg-card border border-border text-foreground hover:bg-secondary/50'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count ? (
                <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-accent/10 text-accent'}`}>
                  {tab.count}
                </span>
              ) : null}
            </motion.button>
          ))}
        </motion.div>

        {/* Incoming Requests Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'incoming' && (
            <motion.div
              key="incoming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 pb-16"
            >
              {incomingLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-16 h-24 bg-secondary rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-secondary rounded w-3/4" />
                          <div className="h-4 bg-secondary rounded w-1/2" />
                          <div className="h-4 bg-secondary rounded w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !incomingRequests?.length ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-12 text-center"
                >
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No incoming requests</h3>
                  <p className="text-muted-foreground">
                    When someone requests one of your books, it will appear here.
                  </p>
                </motion.div>
              ) : (
                incomingRequests.map((request, i) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex gap-4">
                      <Link href={`/books/${request.book.id}`}>
                        <div className="w-16 h-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                          {request.book.images[0] ? (
                            <img src={request.book.images[0]} alt={request.book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <Link href={`/books/${request.book.id}`} className="hover:text-accent transition-colors">
                              <h3 className="font-semibold text-foreground truncate">{request.book.title}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">{request.book.author}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border shrink-0 ${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span>From</span>
                          <span className="font-medium text-foreground">{request.requester.name}</span>
                          <span>•</span>
                          <span className="text-accent font-semibold">{request.pointsOffered} pts</span>
                        </div>

                        {request.message && (
                          <p className="text-sm text-muted-foreground bg-secondary/50 rounded-xl p-3 mb-3 italic">
                            &ldquo;{request.message}&rdquo;
                          </p>
                        )}

                        <div className="flex gap-2">
                          {request.status === 'PENDING' && (
                            <>
                              <motion.button
                                onClick={() => acceptRequest.mutate({ requestId: request.id })}
                                disabled={acceptRequest.isPending}
                                className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {acceptRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Accept
                              </motion.button>
                              <motion.button
                                onClick={() => declineRequest.mutate({ requestId: request.id })}
                                disabled={declineRequest.isPending}
                                className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Decline
                              </motion.button>
                            </>
                          )}
                          {request.status === 'ACCEPTED' && (
                            <motion.button
                              onClick={() => completeExchange.mutate({ requestId: request.id })}
                              disabled={completeExchange.isPending}
                              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {completeExchange.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              Complete Exchange
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Outgoing Requests Tab */}
          {activeTab === 'outgoing' && (
            <motion.div
              key="outgoing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 pb-16"
            >
              {outgoingLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-16 h-24 bg-secondary rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-secondary rounded w-3/4" />
                          <div className="h-4 bg-secondary rounded w-1/2" />
                          <div className="h-4 bg-secondary rounded w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !outgoingRequests?.length ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-12 text-center"
                >
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No outgoing requests</h3>
                  <p className="text-muted-foreground mb-6">You haven&apos;t requested any books yet.</p>
                  <Link href="/books">
                    <motion.div
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-xl cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BookOpen className="w-5 h-5" />
                      Browse Books
                    </motion.div>
                  </Link>
                </motion.div>
              ) : (
                outgoingRequests.map((request, i) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex gap-4">
                      <Link href={`/books/${request.book.id}`}>
                        <div className="w-16 h-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                          {request.book.images[0] ? (
                            <img src={request.book.images[0]} alt={request.book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <Link href={`/books/${request.book.id}`} className="hover:text-accent transition-colors">
                              <h3 className="font-semibold text-foreground truncate">{request.book.title}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">{request.book.author}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border shrink-0 ${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span>Owner</span>
                          <span className="font-medium text-foreground">{request.owner.name}</span>
                          <span>•</span>
                          <span className="text-accent font-semibold">{request.pointsOffered} pts</span>
                        </div>

                        {/* Status Messages */}
                        {request.status === 'PENDING' && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Waiting for {request.owner.name} to respond...
                          </p>
                        )}
                        {request.status === 'ACCEPTED' && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Request accepted! Waiting for owner to complete.
                          </p>
                        )}
                        {request.status === 'COMPLETED' && (
                          <p className="text-sm text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Exchange completed! This book is now yours.
                          </p>
                        )}
                        {request.status === 'DECLINED' && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Request declined. Points refunded.
                          </p>
                        )}

                        {request.status === 'PENDING' && (
                          <motion.button
                            onClick={() => cancelRequest.mutate({ requestId: request.id })}
                            disabled={cancelRequest.isPending}
                            className="px-4 py-2 bg-secondary text-muted-foreground text-sm font-medium rounded-xl disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {cancelRequest.isPending ? 'Cancelling...' : 'Cancel Request'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
