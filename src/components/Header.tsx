'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserDropdown } from '@/components/UserDropdown';
import { PointsDisplay } from '@/components/exchange/PointsDisplay';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Library, Map as MapIcon, MessageSquare, Wallet, Menu, MessageCircle, ClipboardList, X, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Header() {
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: '/books', label: 'Library', icon: Library },
    { href: '/exchange-points', label: 'Stalls', icon: MapIcon },
    { href: '/forums', label: 'Forums', icon: MessageSquare },
  ];

  if (session) {
    navLinks.push({ href: '/wallet', label: 'Wallet', icon: Wallet });
    navLinks.push({ href: '/chat', label: 'Chat', icon: MessageCircle });
    navLinks.push({ href: '/requests', label: 'Requests', icon: ClipboardList });
  }

  return (
    <>
      {/* Floating Header Container */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 pointer-events-none">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`flex items-center justify-between w-full max-w-7xl rounded-full pointer-events-auto transition-all duration-500 px-4 py-2.5 ${scrolled
            ? "bg-secondary/95 backdrop-blur-xl border border-border shadow-xl"
            : "bg-secondary/80 backdrop-blur-lg border border-border/50 shadow-lg"
            }`}
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-2 group flex-shrink-0">
            <motion.div
              className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <BookMarked className="w-5 h-5 text-accent" />
            </motion.div>
            <span className="font-bold text-lg tracking-tight text-accent hidden sm:block">
              BookExchange
            </span>
          </Link>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden md:flex items-center bg-background/60 rounded-full px-1.5 py-1 border border-border/30">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className="flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{link.label}</span>
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 pr-1 flex-shrink-0">
            {/* Points Display - Desktop only */}
            {session && (
              <Link href="/wallet" className="hidden lg:block mr-2">
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PointsDisplay compact />
                </motion.div>
              </Link>
            )}

            {/* Theme Toggle */}
            <motion.div
              className="p-2.5 rounded-full hover:bg-background/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* Notifications */}
            {session && (
              <motion.div
                className="p-2.5 rounded-full hover:bg-background/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NotificationDropdown />
              </motion.div>
            )}

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-border/50 mx-1" />

            {/* User/Auth Section */}
            <div className="flex items-center">
              {isPending ? (
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              ) : session ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserDropdown user={session.user} />
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/signin">
                    <motion.div
                      className="hidden sm:flex text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-full hover:bg-background/50 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign In
                    </motion.div>
                  </Link>
                  <Link href="/signup">
                    <motion.div
                      className="bg-accent text-accent-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-accent-light transition-colors cursor-pointer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      Get Started
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-background/50 ml-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.header>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-4 right-4 top-20 z-50 bg-secondary border border-border rounded-3xl shadow-2xl md:hidden overflow-hidden"
            >
              <div className="p-3">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium text-foreground hover:bg-background/60 transition-colors"
                      >
                        <link.icon className="w-5 h-5 text-accent" />
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Mobile Points Display */}
                  {session && (
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.04 }}
                      className="mt-2 pt-2 border-t border-border/50"
                    >
                      <Link
                        href="/wallet"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-accent/10"
                      >
                        <Wallet className="w-5 h-5 text-accent" />
                        <span className="font-medium">Points:</span>
                        <PointsDisplay compact />
                      </Link>
                    </motion.div>
                  )}

                  {/* Mobile Auth Buttons (when not logged in) */}
                  {!session && !isPending && (
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.04 }}
                      className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-2"
                    >
                      <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-full py-3 text-center font-medium rounded-2xl border border-border hover:bg-background/60 transition-colors">
                          Sign In
                        </div>
                      </Link>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-full py-3 text-center font-semibold rounded-2xl bg-accent text-accent-foreground hover:bg-accent-light transition-colors">
                          Get Started
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
