'use client';

import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight, Compass, Zap, Plane, Users, FileText } from 'lucide-react';

export function Hero() {
  return (
    <section className="w-full pt-8 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-rose-50/40 via-background to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Controls */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-primary text-xs font-black uppercase tracking-wider shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>OFFICIAL B2B PARTNER PORTAL</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
              Empower Your Travel Agency with{' '}
              <span className="relative inline-block text-primary">
                Fzee Travel & Tours
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 25 5, 50 15 T 100 15" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed font-medium">
              Register your agency instantly and streamline your group tours, flight bookings, and hotel arrangements. Zero setup fees, unlimited growth.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link 
                href="/register" 
                className="px-8 py-4 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Register Agency Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link 
                href="#features" 
                className="px-8 py-4 bg-card border border-border text-foreground font-bold text-sm rounded-xl hover:bg-muted/60 transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Features</span>
                <Compass className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 flex-wrap text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Instant Agent Approval</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>24/7 Dedicated Support</span>
              </div>
            </div>

          </div>

          {/* Right Column: Live Portal Mockup Card */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
                  <span className="font-extrabold text-sm text-foreground">Live Portal Overview</span>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-primary text-[10px] font-black rounded-md border border-rose-200 uppercase">
                  B2B ACTIVE
                </span>
              </div>

              {/* Feature Item 1 */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Real-time Group Bookings</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Instant seats reservation for Umrah & Group tours</p>
                </div>
              </div>

              {/* Feature Item 2 */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Plane className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Global Flight Inventory</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Direct B2B rates for major international airlines</p>
                </div>
              </div>

              {/* Feature Item 3 */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Automated Voucher System</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Seamless Excel export and instant pdf invoices</p>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                Trusted by 500+ Registered Travel Agencies Nationwide
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
