'use client';

import Link from 'next/link';
import { Plane, Compass, Zap, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Official B2B Partner Portal</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Empower Your Travel Agency with <span className="text-primary">Fzee Travels & Tours</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
                Register your agency instantly and streamline your group tours, flight bookings, and hotel arrangements. Zero setup fees, unlimited growth.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all font-bold text-base inline-flex items-center justify-center gap-2 group hover:-translate-y-0.5"
              >
                <span>Register Agency Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary rounded-xl transition-all font-bold text-base inline-flex items-center justify-center gap-2"
              >
                <span>Explore Features</span>
                <Compass className="w-5 h-5" />
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Instant Agent Approval</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Zero Subscription Fees</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>24/7 Dedicated Support</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-black/40 rounded-3xl blur-2xl -z-10"></div>
            <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl p-8 border border-border shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                  <span className="font-bold text-sm text-foreground">Live Portal Overview</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-md">B2B Active</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/60 border border-border/50 hover:border-primary/50 transition">
                  <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Real-time Group Bookings</h3>
                    <p className="text-xs text-muted-foreground">Instant seats reservation & ticketing</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/60 border border-border/50 hover:border-primary/50 transition">
                  <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Global Inventory</h3>
                    <p className="text-xs text-muted-foreground">Exclusive B2B rates for flights & hotels</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/60 border border-border/50 hover:border-primary/50 transition">
                  <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Automated Wallet System</h3>
                    <p className="text-xs text-muted-foreground">Seamless top-ups and instant invoicing</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-border">
                <p className="text-xs font-medium text-muted-foreground">
                  Trusted by travel professionals worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
