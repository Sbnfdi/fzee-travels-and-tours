'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 p-10 sm:p-16 text-center space-y-8 shadow-2xl">
          {/* Subtle glow effect */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4 max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              Start Growing Your Agency Today with <span className="text-primary">Fzee Travel & Tours</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Register your agency for free in less than 2 minutes and gain instant access to B2B inventories, bookings, and automated agent tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all font-bold text-base inline-flex items-center justify-center gap-2 group hover:-translate-y-0.5"
            >
              <span>Register Free Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary rounded-xl transition-all font-bold text-base inline-flex items-center justify-center"
            >
              Sign In to Agent Portal
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground pt-4 border-t border-border/60 relative z-10">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              <span>Instant Account Creation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              <span>Free B2B Partner Portal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
