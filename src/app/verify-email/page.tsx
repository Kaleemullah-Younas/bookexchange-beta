'use client';

import { useEffect, useState, Suspense } from 'react';
import { authClient, useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, CheckCircle, AlertCircle, ArrowRight, RefreshCw, LogOut, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { data: session } = useSession();

  const [status, setStatus] = useState<
    'verifying' | 'success' | 'error' | 'waiting'
  >('waiting');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (token) {
      setStatus('verifying');
      const verify = async () => {
        try {
          const { error } = await authClient.verifyEmail({
            query: { token },
          });

          if (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to verify email');
          } else {
            setStatus('success');
            setTimeout(() => router.push('/'), 2000);
          }
        } catch {
          setStatus('error');
          setMessage('An unexpected error occurred');
        }
      };
      verify();
    } else {
      setStatus('error');
      setMessage('Please verify your email address to continue.');
    }
  }, [token, router]);

  const handleResendEmail = async () => {
    if (!session?.user?.email) return;

    setIsResending(true);
    setResendStatus('');

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: '/verify-email',
      });

      if (error) {
        setResendStatus(error.message || 'Failed to send email');
      } else {
        setResendStatus('Email sent! Check your inbox.');
      }
    } catch {
      setResendStatus('Error sending email');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (session?.user?.emailVerified && !token) {
      router.push('/');
    }
  }, [session, token, router]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-16 w-16 rounded-full border-4 border-accent border-t-transparent" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-lg font-medium text-foreground"
        >
          Verifying your email...
        </motion.p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
        <p className="text-muted-foreground">
          Redirecting you to the dashboard...
        </p>
      </motion.div>
    );
  }

  // Default / Error View
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 mb-2"
      >
        <Mail className="h-10 w-10 text-accent" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Verify your Email
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {token
            ? message
            : 'You need to verify your email address to access the account.'}
        </p>
        {session?.user?.email && (
          <div className="mt-4 p-3 bg-secondary/30 rounded-xl border border-border inline-flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {session.user.email}
            </span>
          </div>
        )}
      </div>

      {session ? (
        <div className="space-y-4 pt-4">
          <AnimatePresence>
            {resendStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium ${resendStatus.includes('sent')
                    ? 'bg-green-500/10 border-green-500/20 text-green-600'
                    : 'bg-red-500/10 border-red-500/20 text-red-600'
                  }`}
              >
                {resendStatus.includes('sent') ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {resendStatus}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleResendEmail}
            disabled={isResending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 bg-accent text-accent-foreground font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all"
          >
            {isResending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Resend Verification Email
              </>
            )}
          </motion.button>

          <motion.button
            onClick={async () => {
              await authClient.signOut();
              router.push('/signin');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 bg-card border border-border text-foreground font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </motion.button>
        </div>
      ) : (
        <div className="pt-4">
          <Link href="/signin">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 bg-accent text-accent-foreground font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <Suspense fallback={
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
