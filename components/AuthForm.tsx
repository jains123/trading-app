'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Props {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Create account via Payload REST API
        const createRes = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });

        if (!createRes.ok) {
          const data = await createRes.json().catch(() => null);
          const msg =
            data?.errors?.[0]?.message ||
            data?.message ||
            'Failed to create account. Email may already be in use.';
          setError(msg);
          setLoading(false);
          return;
        }
      }

      // Login via Payload REST API
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // ensures cookie is set
      });

      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => null);
        setError(data?.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Success — redirect to dashboard
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-[#58a6ff] text-2xl">◈</span>
            <span className="font-bold text-[#e6edf3]">Trading Signals</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <h1 className="text-lg font-semibold text-[#e6edf3] text-center mb-6">
            {mode === 'login' ? 'Sign in' : 'Create an account'}
          </h1>

          {error && (
            <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg px-3 py-2 text-xs text-[#f85149] mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5">
                  Name <span className="opacity-50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e]/50 focus:outline-none focus:border-[#58a6ff] transition-colors"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e]/50 focus:outline-none focus:border-[#58a6ff] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e]/50 focus:outline-none focus:border-[#58a6ff] transition-colors"
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Toggle link */}
        <p className="text-center text-xs text-[#8b949e] mt-4">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#58a6ff] hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-[#58a6ff] hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
