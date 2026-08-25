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

          {/* Headline matching user image structure */}
          <div className="space-y-1.5">
            <h1 className="text-xs sm:text-sm lg:text-base font-extrabold text-muted-foreground tracking-[0.25em] uppercase leading-tight">
              WELCOME TO
            </h1>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight uppercase leading-snug drop-shadow-xs">
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

        {/* Destination Cards Row matching user image - Clickable Links to Login */}
        <div className="mt-14 sm:mt-18">
          <div className="flex items-center justify-between mb-6 px-1">
            <div>
              <span className="text-xs font-black text-primary uppercase tracking-widest block">Top Destinations & Seat Blocks</span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Explore B2B Group Fares</h3>
            </div>
            <Link href="/login" className="text-xs font-black text-primary hover:text-primary/80 flex items-center gap-1 uppercase tracking-wider transition-colors">
              <span>View All Rates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {destinations.map((dest, idx) => (
              <Link 
                key={idx}
                href="/login"
                className="group relative h-56 sm:h-64 md:h-72 rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 shadow-md hover:shadow-2xl hover:shadow-rose-600/20 hover:-translate-y-2 transition-all duration-500 bg-slate-950 flex flex-col justify-between p-3.5 sm:p-4 text-left cursor-pointer"
              >
                {/* Top Pill Badge */}
                <div className="relative z-10 self-start px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] font-black text-white/90 uppercase tracking-wider shadow-xs group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                  <span>{dest.subtext}</span>
                </div>

                {/* Background Image with Zoom */}
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay for High Contrast Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 group-hover:from-black/90 transition-colors duration-500" />

                {/* Hover Glowing Border */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-primary/60 transition-colors duration-500 z-20 pointer-events-none" />

                {/* Bottom Card Info & Call to Action */}
                <div className="relative z-10 text-white space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-black text-base sm:text-lg tracking-tight leading-tight group-hover:text-rose-300 transition-colors duration-300 drop-shadow-md">
                      {dest.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                  </div>
                  <span className="text-[10px] font-extrabold text-rose-200/90 tracking-wider uppercase block">
                    Tap to Book →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
