'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

type TabType = 'incoming' | 'outgoing';
type StatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-warning/10', text: 'text-warning' },
  ACCEPTED: { bg: 'bg-accent/10', text: 'text-accent' },
  COMPLETED: { bg: 'bg-success/10', text: 'text-success' },
  DECLINED: { bg: 'bg-destructive/10', text: 'text-destructive' },
  CANCELLED: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

export function RequestsManager() {
  const [activeTab, setActiveTab] = useState<TabType>('incoming');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const utils = trpc.useUtils();

  const { data: counts } = trpc.exchange.getRequestCounts.useQuery();

  const incomingQuery = trpc.exchange.getIncomingRequests.useQuery(
    {
      status:
        statusFilter === 'ALL'
          ? undefined
          : (statusFilter as
              | 'PENDING'
              | 'ACCEPTED'
              | 'COMPLETED'
              | 'DECLINED'
              | 'CANCELLED'),
    },
    { enabled: activeTab === 'incoming' }
  );

  const outgoingQuery = trpc.exchange.getOutgoingRequests.useQuery(
    {
      status:
        statusFilter === 'ALL'
          ? undefined
          : (statusFilter as
              | 'PENDING'
              | 'ACCEPTED'
              | 'COMPLETED'
              | 'DECLINED'
              | 'CANCELLED'),
    },
    { enabled: activeTab === 'outgoing' }
  );

  const acceptRequest = trpc.exchange.acceptRequest.useMutation({
    onSuccess: () => {
      utils.exchange.getIncomingRequests.invalidate();
      utils.exchange.getRequestCounts.invalidate();
    },
  });

  const declineRequest = trpc.exchange.declineRequest.useMutation({
    onSuccess: () => {
      utils.exchange.getIncomingRequests.invalidate();
      utils.exchange.getRequestCounts.invalidate();
    },
  });

  const completeExchange = trpc.exchange.completeExchange.useMutation({
    onSuccess: () => {
      utils.exchange.getIncomingRequests.invalidate();
      utils.exchange.getUserPoints.invalidate();
      utils.exchange.getRequestCounts.invalidate();
    },
  });

  const cancelRequest = trpc.exchange.cancelRequest.useMutation({
    onSuccess: () => {
      utils.exchange.getOutgoingRequests.invalidate();
      utils.exchange.getUserPoints.invalidate();
      utils.exchange.getRequestCounts.invalidate();
    },
  });

  const requests =
    activeTab === 'incoming' ? incomingQuery.data : outgoingQuery.data;
  const isLoading =
    activeTab === 'incoming'
      ? incomingQuery.isLoading
      : outgoingQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-secondary/50">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'incoming'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          Incoming
          {(counts?.pendingIncoming ?? 0) > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent text-white text-xs font-bold">
              {counts?.pendingIncoming}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'outgoing'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          Outgoing
          {(counts?.pendingOutgoing ?? 0) > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-warning text-white text-xs font-bold">
              {counts?.pendingOutgoing}
            </span>
          )}
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(
          [
            'ALL',
            'PENDING',
            'ACCEPTED',
            'COMPLETED',
            'DECLINED',
            'CANCELLED',
          ] as const
        ).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === status
                ? 'bg-accent text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {status === 'ALL'
              ? 'All'
              : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 rounded-xl bg-muted" />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No Requests Found
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'incoming'
              ? "You haven't received any book requests yet."
              : "You haven't made any book requests yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => {
            const statusStyle = STATUS_STYLES[request.status];
            const person =
              activeTab === 'incoming' ? request.requester : request.owner;

            return (
              <div
                key={request.id}
                className="p-4 rounded-xl bg-card border border-border"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Book Image */}
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {request.book.images?.[0] && (
                      <img
                        src={request.book.images[0]}
                        alt={request.book.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Book & Person Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {request.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground truncate">
                      {request.book.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.book.author}
                    </p>

                    {/* Person */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
                        {person.image ? (
                          <img
                            src={person.image}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-accent">
                            {person.name?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {activeTab === 'incoming' ? 'From' : 'Owner'}:{' '}
                        <span className="text-foreground">{person.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">
                      {request.pointsOffered}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>

                {/* Message */}
                {request.message && (
                  <div className="p-3 rounded-lg bg-secondary/30 mb-4">
                    <p className="text-sm text-muted-foreground italic">
                      "{request.message}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                {activeTab === 'incoming' && request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        acceptRequest.mutate({ requestId: request.id })
                      }
                      disabled={acceptRequest.isPending}
                      className="flex-1 px-4 py-2 rounded-lg bg-success text-white font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        declineRequest.mutate({ requestId: request.id })
                      }
                      disabled={declineRequest.isPending}
                      className="flex-1 px-4 py-2 rounded-lg bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {activeTab === 'incoming' && request.status === 'ACCEPTED' && (
                  <button
                    onClick={() =>
                      completeExchange.mutate({ requestId: request.id })
                    }
                    disabled={completeExchange.isPending}
                    className="w-full px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
                  >
                    {completeExchange.isPending
                      ? 'Processing...'
                      : 'Mark as Completed'}
                  </button>
                )}

                {activeTab === 'outgoing' && request.status === 'PENDING' && (
                  <button
                    onClick={() =>
                      cancelRequest.mutate({ requestId: request.id })
                    }
                    disabled={cancelRequest.isPending}
                    className="w-full px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-secondary/50 transition-colors disabled:opacity-50"
                  >
                    {cancelRequest.isPending
                      ? 'Cancelling...'
                      : 'Cancel Request'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
