'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PointsStats } from '@/components/exchange/PointsDisplay';
import { TransactionHistory } from '@/components/exchange/TransactionHistory';
import { RequestsManager } from '@/components/exchange/RequestsManager';
import { BuyPointsCard } from '@/components/exchange/BuyPointsCard';
import { ReadingInsights } from '@/components/ReadingInsights';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LayoutGrid, Clock, ArrowLeftRight, Search, Plus, BookPlus, Coins, Gift, HelpCircle, Sparkles, X, Check, Loader2 } from 'lucide-react';

type TabType = 'overview' | 'history' | 'requests';

function WalletContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const utils = trpc.useUtils();

  // Handle Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const points = searchParams.get('points');

    if (success === 'true' && points) {
      setNotification({
        type: 'success',
        message: `Successfully purchased ${parseInt(points).toLocaleString()} points!`,
      });
      utils.exchange.getUserPoints.invalidate();
      router.replace('/wallet');
    } else if (canceled === 'true') {
      setNotification({
        type: 'error',
        message: 'Payment was cancelled.',
      });
      router.replace('/wallet');
    }
  }, [searchParams, router, utils]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!session) {
    router.push('/signin');
    return null;
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutGrid },
    { id: 'history' as TabType, label: 'History', icon: Clock },
    { id: 'requests' as TabType, label: 'Requests', icon: ArrowLeftRight },
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
              className={`px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 ${notification.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                }`}
            >
              {notification.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <p className="font-medium">{notification.message}</p>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
              className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center"
            >
              <Wallet className="w-6 h-6 text-accent" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                My Wallet
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your points and exchange requests
              </p>
            </div>
          </div>
        </motion.div>

        {/* Points Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <PointsStats />
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-8 border-b border-border pb-4"
        >
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-16"
            >
              {/* Buy Points Card */}
              <BuyPointsCard />

              {/* AI Reading Insights */}
              <ReadingInsights />

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-accent" />
                  How the Points System Works
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Earning Points */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-sm font-bold">
                        +
                      </span>
                      Earn Points
                    </h3>
                    <ul className="space-y-3">
                      {[
                        { icon: BookPlus, title: 'List a Book', desc: 'Earn 10 points for every book you list' },
                        { icon: ArrowLeftRight, title: 'Complete an Exchange', desc: 'Earn points when you give away a book' },
                        { icon: Gift, title: 'Welcome Bonus', desc: 'New users start with 100 points' },
                      ].map((item, i) => (
                        <motion.li
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Spending Points */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold">
                        −
                      </span>
                      Spend Points
                    </h3>
                    <ul className="space-y-3">
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <Coins className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Request a Book</p>
                          <p className="text-sm text-muted-foreground">
                            Points are based on book value (AI calculated)
                          </p>
                        </div>
                      </motion.li>
                    </ul>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 rounded-xl bg-accent/5 border border-accent/20 mt-4"
                    >
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        AI-Powered Pricing
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Book values are calculated based on condition, rarity, and
                        demand. Better condition and rarer books are worth more points.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/books">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all group cursor-pointer h-full"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Browse Books</h3>
                        <p className="text-sm text-muted-foreground">Find your next read</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/books?addBook=true">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all group cursor-pointer h-full"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">List a Book</h3>
                        <p className="text-sm text-muted-foreground">Earn 10 points per listing</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pb-16"
            >
              <TransactionHistory />
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pb-16"
            >
              <RequestsManager />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <WalletContent />
    </Suspense>
  );
}
