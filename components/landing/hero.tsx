'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Plane, ShieldCheck, CheckCircle2, Sparkles, MapPin, Compass } from 'lucide-react';

export function Hero() {
  const [heroMounted, setHeroMounted] = useState(false);

  useEffect(() => {
    // Reveal hero elements in cinematic sequence
    const timer = setTimeout(() => {
      setHeroMounted(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

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
    <section className="w-full pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-rose-50/50 via-background to-background relative overflow-hidden">
      
      {/* Background Animated Flight Route & Gliding Plane Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle World Map Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035]" />
        
        {/* Connecting Flight Route Arc */}
        <svg className="absolute top-0 left-0 w-full h-[400px] opacity-40" viewBox="0 0 1200 400" fill="none" preserveAspectRatio="none">
          <path
            d="M -100,180 C 250,40 600,280 950,110 C 1100,40 1250,160 1400,100"
            stroke="url(#heroRouteGradient)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="heroRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* The Ambient Gliding Airplane that settled into the Hero background */}
        <div className="absolute top-[18%] right-[8%] md:right-[15%] opacity-35 hover:opacity-80 transition-opacity duration-700 animate-float hidden sm:block">
          <div className="relative flex items-center">
            {/* Jet contrail tail */}
            <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-rose-400 to-rose-500 rounded-full" />
            <Plane className="w-6 h-6 text-primary rotate-45 shrink-0 drop-shadow-md" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header Content - Centered */}
        <div className="text-center max-w-4xl mx-auto space-y-6">

          {/* Top Brand Pill Badge */}
          <div className={`transition-all duration-700 delay-100 transform ${heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 shadow-xs text-primary font-black text-xs uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>FZEE TOURS & TRAVELS • B2B PORTAL</span>
            </div>
          </div>

          {/* The Core Requested Headline: EXPLORE THE WORLD. WE'LL HANDLE THE JOURNEY. */}
          <div className={`space-y-2 transition-all duration-700 delay-200 transform ${heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.08]">
              EXPLORE THE WORLD. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-rose-600 to-amber-500 bg-clip-text text-transparent drop-shadow-xs">
                WE&apos;LL HANDLE THE JOURNEY.
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className={`text-muted-foreground text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-300 transform ${heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Your premier wholesale gateway for live flight blocks, exclusive Umrah quotas, verified hotels, and instant B2B confirmations.
          </p>

          {/* Action CTAs */}
          <div className={`flex flex-wrap items-center justify-center gap-4 pt-2 transition-all duration-700 delay-400 transform ${heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Link 
              href="/register" 
              className="px-8 py-4 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-wider group"
            >
              <span>Register Agency Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/login" 
              className="px-8 py-4 bg-card border border-border/90 text-foreground font-black text-sm rounded-xl hover:bg-muted/60 transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-xs hover:-translate-y-0.5"
            >
              <span>Agent Sign In</span>
            </Link>
          </div>

          {/* Key Indicators */}
          <div className={`flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-extrabold text-muted-foreground transition-all duration-700 delay-500 transform ${heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-border/50 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-border/50 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Wholesale Net Rates</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-border/50 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>24/7 Dedicated Support</span>
            </div>
          </div>

        </div>

        {/* Destination Cards Row - Clickable Links to Login */}
        <div className={`mt-14 sm:mt-18 transition-all duration-700 delay-600 transform ${heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
