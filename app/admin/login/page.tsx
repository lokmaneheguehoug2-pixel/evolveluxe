'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockKeyhole, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, hydrated, isLoading, signIn, signOut } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (hydrated && user?.role === 'admin') router.replace('/admin');
  }, [hydrated, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(result.error);
      return;
    }
    const signedInUser = useAuthStore.getState().user;
    if (signedInUser?.role !== 'admin') {
      await signOut();
      setError('This account does not have administrator access.');
      return;
    }
    router.replace('/admin');
  }

  return (
    <main className="min-h-screen bg-burgundy-700 text-champagne-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-champagne-200/70 hover:text-champagne-200 mb-12">
          <ArrowLeft className="h-4 w-4" /> Return to store
        </Link>
        <div className="mb-8">
          <p className="text-champagne-400 text-xs uppercase tracking-[0.3em] mb-3">Private workspace</p>
          <h1 className="font-serif text-4xl text-champagne-200">EVOLVE <span className="text-champagne-400 font-light">Admin</span></h1>
          <p className="mt-3 text-champagne-200/60 leading-relaxed">Sign in with the designated administrator account to manage your store.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-burgundy-600/60 border border-champagne-400/15 rounded-lg p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-5 border-b border-champagne-400/15">
            <div className="p-3 rounded-full bg-champagne-400/10"><LockKeyhole className="h-5 w-5 text-champagne-400" /></div>
            <div><p className="font-medium">Administrator sign in</p><p className="text-xs text-champagne-200/50">Protected access</p></div>
          </div>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wider text-champagne-200/70">
            Email address
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="luxe-input bg-burgundy-700/60 border-champagne-400/20 text-champagne-200 placeholder:text-champagne-200/30" />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wider text-champagne-200/70">
            Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="luxe-input bg-burgundy-700/60 border-champagne-400/20 text-champagne-200 placeholder:text-champagne-200/30" />
          </label>
          {error && <p role="alert" className="text-sm text-red-200 bg-red-950/20 border border-red-200/20 rounded-md p-3">{error}</p>}
          <button type="submit" disabled={isLoading || !hydrated} className="luxe-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in securely
          </button>
        </form>
      </div>
    </main>
  );
}
