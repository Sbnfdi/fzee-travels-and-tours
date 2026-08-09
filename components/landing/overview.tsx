'use client';

import { CheckCircle2, ChevronRight, LayoutDashboard, CalendarDays, Wallet } from 'lucide-react';
import Link from 'next/link';

export function Overview() {
  const portalFeatures = [
    { icon: LayoutDashboard, title: 'Live Inventory Browser', desc: 'Browse available flights, hotels, and packages in real-time.' },
    { icon: CalendarDays, title: 'Instant Booking Engine', desc: 'Hold seats, generate PNRs, and confirm group bookings instantly.' },
    { icon: Wallet, title: 'Wallet & Finance', desc: 'Manage invoices, track payments, and top-up your agency wallet.' },
  ];

  return (
    <section className="w-full py-24 border-t border-border/40 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-block text-primary font-black text-xs uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200/80 shadow-xs">
            PORTAL PREVIEW
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            See what's inside the B2B portal
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            A powerful, all-in-one dashboard designed exclusively for travel agents.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Mockup Image / UI */}
          <div className="relative group">
            <div className="relative bg-card border border-border/80 rounded-3xl shadow-xl overflow-hidden aspect-video flex flex-col transition-all duration-300 hover:shadow-2xl">
              {/* Browser Header */}
              <div className="h-10 bg-muted/60 border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="mx-auto w-1/2 h-5 bg-background rounded-md border border-border/60"></div>
              </div>
              
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 flex gap-6 bg-muted/20">
                {/* Sidebar */}
                <div className="w-1/4 space-y-3 hidden sm:block">
                  <div className="w-full h-8 bg-primary/10 rounded-md border border-primary/20"></div>
                  <div className="w-3/4 h-6 bg-muted rounded-md"></div>
                  <div className="w-5/6 h-6 bg-muted rounded-md"></div>
                  <div className="w-4/5 h-6 bg-muted rounded-md"></div>
                </div>
                {/* Main Area */}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 h-20 bg-rose-50 border border-rose-100 rounded-xl"></div>
                    <div className="flex-1 h-20 bg-card border border-border rounded-xl"></div>
                    <div className="flex-1 h-20 bg-card border border-border rounded-xl"></div>
                  </div>
                  <div className="w-full h-40 bg-card rounded-xl border border-border p-4 space-y-3">
                    <div className="w-1/3 h-5 bg-primary/10 rounded-md"></div>
                    <div className="w-full h-8 bg-muted/60 rounded-md"></div>
                    <div className="w-full h-8 bg-muted/60 rounded-md"></div>
                  </div>
                </div>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link href="/register" className="px-6 py-3 bg-primary text-primary-foreground font-black rounded-xl shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-all uppercase tracking-wider text-sm">
                  Register to Access <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-6">
              {portalFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-5 p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300 group">
                  <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                    <feat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-xl group-hover:text-primary transition-colors">{feat.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/60">
              <Link href="/register" className="inline-flex items-center gap-2 text-primary font-black hover:underline uppercase tracking-widest text-xs">
                Start Free Registration <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
