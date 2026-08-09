'use client';

import Link from 'next/link';
import { ArrowRight, Plane, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';

export function Hero() {
  const destinations = [
    {
      name: 'Dubai',
      subtext: 'Fixed Seats',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Baku',
      subtext: 'Group Packages',
      image: '/destinations/baku.png',
    },
    {
      name: 'Muscat',
      subtext: 'Group Fares',
      image: '/destinations/muscat.png',
    },
    {
      name: 'Qatar',
      subtext: 'Group Seats',
      image: '/destinations/qatar.png',
    },
    {
      name: 'UK',
      subtext: 'Direct Flights',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Maldives',
      subtext: 'Honeymoon Packages',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Saudi Arabia',
      subtext: 'Hajj & Umrah',
      image: '/destinations/saudi.png',
    },
  ];

  return (
    <section className="w-full pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-rose-50/40 via-background to-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Content - Centered */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-primary text-xs font-black uppercase tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>OFFICIAL B2B AGENT NETWORK</span>
          </div>

          {/* Headline matching user image structure */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight uppercase leading-tight">
              WELCOME TO
            </h1>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-primary tracking-tight uppercase leading-none drop-shadow-xs">
              FZEE TRAVEL & TOURS
            </h2>
          </div>

          {/* Subtitle matching user image */}
          <p className="text-muted-foreground text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Your premium gateway for seamless group bookings, flights, and exclusive travel packages.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Register Agency Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              href="/login" 
              className="px-8 py-4 bg-card border border-border/90 text-foreground font-black text-sm rounded-xl hover:bg-muted/60 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Agent Sign In</span>
            </Link>
          </div>

          {/* Key Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-extrabold text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Wholesale Group Fares</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>24/7 Agent Support</span>
            </div>
          </div>

        </div>

        {/* Destination Cards Row matching user image */}
        <div className="mt-16 sm:mt-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {destinations.map((dest, idx) => (
              <div 
                key={idx}
                className="group relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden border border-border/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 bg-card cursor-pointer"
              >
                {/* Background Image */}
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Dark Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-center text-white flex flex-col items-center justify-end">
                  <h3 className="font-black text-sm sm:text-base md:text-lg tracking-tight drop-shadow-md leading-tight group-hover:text-amber-400 transition-colors">
                    {dest.name}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-bold text-white/80 tracking-wider uppercase mt-0.5">
                    {dest.subtext}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
