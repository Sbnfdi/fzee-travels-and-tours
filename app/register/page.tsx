'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plane, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyName,
          email,
          contactPerson,
          password,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      // Automatically redirect to agent portal on successful registration
      router.push('/agent');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 font-sans bg-gradient-to-b from-rose-50/40 via-background to-background text-foreground">

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex justify-center items-center gap-3.5 group">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-xl shadow-black/25 group-hover:scale-105 transition-transform shrink-0 border border-primary/30">
            <Image 
              src="/logo.png" 
              alt="Fzee Tours & Travels Logo" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-foreground font-black text-2xl tracking-tight">FZEE</span>
            <span className="text-[11px] tracking-widest uppercase text-primary font-extrabold mt-0.5">Tours & Travels</span>
          </div>
        </Link>

        {/* Form Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl text-foreground">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Agent Registration</h1>
            <p className="text-sm text-muted-foreground font-medium">Join Fzee Travel & Tours network and manage bookings instantly</p>
          </div>

          {/* Approval Timeline */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground border-y border-border/50 py-4 relative">
            <div className="flex flex-col items-center gap-1.5 w-1/3 text-center">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">1</div>
              <span className="text-foreground">Form (2m)</span>
            </div>
            
            <div className="flex-1 h-px bg-border/50"></div>
            
            <div className="flex flex-col items-center gap-1.5 w-1/3 text-center">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">2</div>
              <span>Verify Call</span>
            </div>

            <div className="flex-1 h-px bg-border/50"></div>

            <div className="flex flex-col items-center gap-1.5 w-1/3 text-center">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">3</div>
              <span>Portal Access</span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Agency Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Skyline Travel Agency"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Contact Person Name</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@agency.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/25 transition-all text-sm inline-flex items-center justify-center gap-2 group"
            >
              <span>{loading ? 'Creating Agency Account...' : 'Register Agency Free'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Already registered?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign in to portal
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          By registering, you agree to <span className="text-foreground font-medium">Fzee Travel & Tours</span> Partner Terms & Conditions.
        </p>
      </div>
    </div>
  );
}
