'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { BookGrid } from '@/components/books/BookGrid';
import { AddBookForm } from '@/components/books/AddBookForm';
import { AIRecommendations } from '@/components/books/AIRecommendations';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Search, ArrowRightLeft, X, BookOpen, Filter } from 'lucide-react';
import Link from 'next/link';

export default function BooksPage() {
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);

  const steps = [
    {
      icon: Camera,
      title: 'List Your Book',
      description: 'Take photos and describe the condition',
    },
    {
      icon: Search,
      title: 'Find & Connect',
      description: 'Browse and connect with book owners',
    },
    {
      icon: ArrowRightLeft,
      title: 'Exchange & Enjoy',
      description: 'Meet up or ship, then enjoy your new book',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Page Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
              <BookOpen className="w-6 h-6 text-accent" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Book Library
              </h1>
              <p className="text-muted-foreground text-sm">
                Discover and exchange pre-loved books
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <motion.button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold shadow-lg shadow-accent/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Plus className="w-4 h-4" />
                List Your Book
              </motion.button>
            ) : (
              <Link href="/signin">
                <motion.div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In to List
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* How It Works - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              whileHover={{ y: -2 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50 hover:border-accent/30 transition-all"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <step.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                <p className="text-muted-foreground text-xs">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Add Book Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
          >
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddForm(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl mx-4 my-8 sm:my-16"
            >
              <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground">
                      List a New Book
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share your book with the community
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setShowAddForm(false)}
                    className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Modal Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <AddBookForm
                    onSuccess={() => setShowAddForm(false)}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AIRecommendations />
        </motion.div>

        {/* Available Books Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Available Books
              </h2>
              <p className="text-muted-foreground text-sm">
                Browse and find your next great read
              </p>
            </div>
          </div>

          <BookGrid />
        </motion.div>
      </div>
    </div>
  );
}
