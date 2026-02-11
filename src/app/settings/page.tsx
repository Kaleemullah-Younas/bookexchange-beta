'use client';

import { useState } from 'react';
import { useSession, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Shield, Loader2, Check, X, Mail, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Profile State
  const [name, setName] = useState(session?.user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: '',
    text: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await (authClient as any).updateUser({
        name: name,
      });

      if (res?.error) {
        setProfileMessage({
          type: 'error',
          text: res.error.message || 'Failed to update profile',
        });
      } else {
        setProfileMessage({
          type: 'success',
          text: 'Profile updated successfully',
        });
        router.refresh();
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const res = await (authClient as any).changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res?.error) {
        setPasswordMessage({
          type: 'error',
          text: res.error.message || 'Failed to update password',
        });
      } else {
        setPasswordMessage({
          type: 'success',
          text: 'Password changed successfully',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
            <Settings className="w-6 h-6 text-accent" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your profile and security preferences
            </p>
          </div>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Update your display name</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <AnimatePresence>
              {profileMessage.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-xl p-3 text-sm flex items-center gap-2 ${profileMessage.type === 'error'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'bg-green-500/10 text-green-600 dark:text-green-400'
                    }`}
                >
                  {profileMessage.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {profileMessage.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={session.user.email}
                  disabled
                  className="w-full h-11 rounded-xl border border-border bg-secondary/30 pl-10 pr-4 text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <motion.button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Update Profile
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground">Change your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <AnimatePresence>
              {passwordMessage.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-xl p-3 text-sm flex items-center gap-2 ${passwordMessage.type === 'error'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'bg-green-500/10 text-green-600 dark:text-green-400'
                    }`}
                >
                  {passwordMessage.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {passwordMessage.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Current Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Change Password
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
