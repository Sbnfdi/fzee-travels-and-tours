'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function ModernPreloader() {
  const [loading, setLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Animate progress smoothly
    const p1 = setTimeout(() => setProgress(45), 200);
    const p2 = setTimeout(() => setProgress(75), 500);
    const p3 = setTimeout(() => setProgress(100), 900);

    // Trigger smooth fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1200);

    // Remove from DOM
    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#070b14] text-white transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-hidden="true"
    >
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 rounded-full bg-rose-600/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Main Center Stage */}
      <div className="relative flex flex-col items-center justify-center z-10 px-4">
        
        {/* Orbital Ring & Logo Wrapper */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          
          {/* Outer Rotating Glowing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 border-r-rose-400/50 animate-spin [animation-duration:2.5s]" />
          
          {/* Inner Counter-Rotating Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-amber-400/70 border-l-rose-500/40 animate-spin [animation-duration:3.5s] [animation-direction:reverse]" />
          
          {/* Subtle Outer Pulse Ring */}
          <div className="absolute -inset-2 rounded-full border border-white/10 animate-ping [animation-duration:3s] opacity-30" />

          {/* Logo Emblem Center */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-[0_0_40px_rgba(225,29,72,0.35)] border-2 border-rose-500/30 bg-slate-950/80 p-0.5">
            <Image
              src="/logo.png"
              alt="FZEE Tours & Travels"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="mt-7 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
              FZEE
            </span>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-rose-400">
            <span>TOURS & TRAVELS</span>
          </div>
        </div>

        {/* Modern Slim Progress Bar */}
        <div className="mt-8 w-48 sm:w-56 space-y-2 text-center">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-amber-400 to-rose-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(244,63,94,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            {progress < 100 ? 'Preparing Journey...' : 'Welcome Aboard'}
          </span>
        </div>

      </div>
    </div>
  );
}
