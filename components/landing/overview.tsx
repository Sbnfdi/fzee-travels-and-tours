'use client';

import { CheckCircle2, ChevronRight, LayoutDashboard, CalendarDays, Wallet } from 'lucide-react';
import Link from 'next/link';

export function Overview() {
  const portalFeatures = [
    { icon: LayoutDashboard, title: 'Live Inventory Browser', desc: 'Browse available flights, hotels, and packages in real-time.' },
    { icon: CalendarDays, title: 'Instant Booking Engine', desc: 'Hold seats, generate PNRs, and confirm group bookings instantly.' },
    { icon: Wallet, title: 'Wallet & Finance', desc: 'Manage invoices, track commissions, and top-up your agency wallet.' },
  ];

  return (
    <section className="w-full py-24 relative z-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-block text-primary font-bold text-xs uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            Portal Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
            See what's inside the B2B portal
          </h2>
          <p className="text-base sm:text-lg text-white/80 font-medium">
            A powerful, all-in-one dashboard designed exclusively for travel agents.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Mockup Image / UI */}
          <div className="relative group perspective-1000">
            {/* Ambient Animated Glowing Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-r from-primary/30 to-amber-500/20 blur-[100px] rounded-full pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-primary/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse"></div>
            
            <div className="relative bg-[#0f172a]/70 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden aspect-video flex flex-col transform-gpu transition-all duration-700 hover:rotate-y-[5deg] hover:-rotate-x-[2deg] hover:scale-[1.02]">
              {/* Browser Header */}
              <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="mx-auto w-1/2 h-5 bg-white/5 rounded-md border border-white/5"></div>
              </div>
              
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 flex gap-6">
                {/* Sidebar */}
                <div className="w-1/4 space-y-3 hidden sm:block">
                  <div className="w-full h-8 bg-white/10 rounded-md"></div>
                  <div className="w-3/4 h-6 bg-white/5 rounded-md"></div>
                  <div className="w-5/6 h-6 bg-white/5 rounded-md"></div>
                  <div className="w-4/5 h-6 bg-white/5 rounded-md"></div>
                </div>
                {/* Main Area */}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 h-20 bg-primary/20 border border-primary/30 rounded-xl"></div>
                    <div className="flex-1 h-20 bg-white/5 rounded-xl"></div>
                    <div className="flex-1 h-20 bg-white/5 rounded-xl"></div>
                  </div>
                  <div className="w-full h-40 bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                    <div className="w-1/3 h-5 bg-white/10 rounded-md"></div>
                    <div className="w-full h-8 bg-white/5 rounded-md"></div>
                    <div className="w-full h-8 bg-white/5 rounded-md"></div>
                  </div>
                </div>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link href="/register" className="px-6 py-3 bg-primary text-primary-foreground font-black rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-transform uppercase tracking-wider text-sm">
                  Register to Access <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-6">
              {portalFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-5 p-5 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group shadow-xl">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner group-hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] group-hover:scale-110 border border-white/5">
                    <feat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xl drop-shadow-sm group-hover:text-primary transition-colors">{feat.title}</h3>
                    <p className="text-white/70 text-sm mt-1.5 leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link href="/register" className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors uppercase tracking-widest text-sm">
                Start Free Registration <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
