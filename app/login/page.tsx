'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plane, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Invalid credentials.');
        return;
      }

      // Role-based redirection logic
      const role = data.user?.role;
      if (
        role === 'SUPER_ADMIN' ||
        role === 'ADMIN' ||
        role === 'FINANCE_ADMIN' ||
        role === 'BOOKING_MANAGER' ||
        role === 'SUPPORT_STAFF'
      ) {
        router.push('/dashboard');
      } else {
        router.push('/agent');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 font-sans overflow-hidden">
      {/* Global Video Background with Premium Mesh Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-lighten"
        >
          <source src="https://cdn.pixabay.com/video/2016/09/21/5412-183786499_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex justify-center items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Plane className="w-6 h-6 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-foreground font-black text-2xl tracking-tight">FZEE</span>
            <span className="text-[11px] tracking-widest uppercase text-primary font-extrabold">Travel & Tours</span>
          </div>
        </Link>

        {/* Form Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-black text-foreground tracking-tight">B2B Portal Sign In</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account credentials</p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@fzeetravels.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/25 transition-all text-sm inline-flex items-center justify-center gap-2 group"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to Portal'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-1">
            Don&apos;t have an agent account?{' '}
            <Link href="/register" className="text-primary hover:underline font-bold">
              Register Free
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Fzee Travels and Tours. All rights reserved.
        </p>
      </div>
    </div>
  );
}
