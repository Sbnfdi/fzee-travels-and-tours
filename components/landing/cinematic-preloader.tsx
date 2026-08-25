'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CinematicPreloaderProps {
  onComplete?: () => void;
}

export function CinematicPreloader({ onComplete }: CinematicPreloaderProps) {
  const [phase, setPhase] = useState<'flying' | 'revealing' | 'transitioning' | 'completed'>('flying');
  const [progress, setProgress] = useState(0); // 0 to 100

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 2800; // 2.8 seconds cinematic flight

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(currentProgress);

      if (currentProgress < 50) {
        setPhase('flying');
      } else if (currentProgress < 85) {
        setPhase('revealing');
      } else if (currentProgress < 100) {
        setPhase('transitioning');
      }

      if (currentProgress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setPhase('completed');
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  if (phase === 'completed') return null;

  // Calculate Airplane Coordinates along a curved cubic bezier path
  // Start: (-5%, 65%), Peak: (35%, 35%), Dip: (65%, 55%), Exit: (105%, 30%)
  const t = progress / 100;
  
  // Parametric Bezier X & Y
  const p0 = { x: -8, y: 65 };
  const p1 = { x: 35, y: 25 };
  const p2 = { x: 65, y: 60 };
  const p3 = { x: 108, y: 28 };

  // Cubic Bezier formula: B(t) = (1-t)^3 * p0 + 3(1-t)^2*t * p1 + 3(1-t)*t^2 * p2 + t^3 * p3
  const cx = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
  const cy = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;

  // Calculate tangent angle for airplane rotation
  const dt = 0.01;
  const nextT = Math.min(t + dt, 1);
  const nextX = Math.pow(1 - nextT, 3) * p0.x + 3 * Math.pow(1 - nextT, 2) * nextT * p1.x + 3 * (1 - nextT) * Math.pow(nextT, 2) * p2.x + Math.pow(nextT, 3) * p3.x;
  const nextY = Math.pow(1 - nextT, 3) * p0.y + 3 * Math.pow(1 - nextT, 2) * nextT * p1.y + 3 * (1 - nextT) * Math.pow(nextT, 2) * p2.y + Math.pow(nextT, 3) * p3.y;
  
  const angleRad = Math.atan2(nextY - cy, nextX - cx);
  const angleDeg = (angleRad * 180) / Math.PI;

  return (
    <div 
      className={`fixed inset-0 z-[200] pointer-events-none transition-all duration-700 ease-out overflow-hidden ${
        phase === 'transitioning' ? 'opacity-0 scale-105 backdrop-blur-none' : 'opacity-100 backdrop-blur-3xl bg-slate-950/95'
      }`}
    >
      {/* Background Deep Sky Texture & World Map Subtle Silhouette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(225,29,72,0.12),transparent_70%)] pointer-events-none" />

      {/* SVG Flight Path Line with Glowing Gradient */}
      <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="flightTrailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0" />
            <stop offset="40%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#fb7185" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The Continuous Flight Path */}
        <path
          d="M -80 390 C 350 150, 650 360, 1080 168"
          fill="none"
          stroke="url(#flightTrailGradient)"
          strokeWidth="3"
          strokeDasharray="1400"
          strokeDashoffset={1400 - (progress / 100) * 1400}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      </svg>

      {/* Center Brand Identity (Gradually Revealed as Plane crosses) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <div 
          className="flex flex-col items-center gap-4 transition-all duration-700 ease-out"
          style={{
            opacity: Math.max(0, Math.min(1, (progress - 25) / 40)),
            transform: `scale(${0.85 + Math.min(0.15, (progress / 100) * 0.15)}) translateY(${progress < 30 ? '20px' : '0px'})`,
          }}
        >
          {/* Logo Emblem */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.4)] border-2 border-rose-500/40 p-1 bg-slate-950/80 backdrop-blur-xl">
            <Image 
              src="/logo.png" 
              alt="FZEE Tours & Travels" 
              fill 
              className="object-cover rounded-full"
              priority
            />
          </div>

          {/* Typography */}
          <div className="text-center space-y-1">
            <span className="block text-2xl sm:text-4xl font-black text-white tracking-widest uppercase drop-shadow-[0_2px_15px_rgba(255,255,255,0.3)]">
              FZEE TOURS & TRAVELS
            </span>
            <span className="block text-[10px] sm:text-xs font-black tracking-[0.35em] text-rose-400 uppercase">
              EXPLORE • EXPERIENCE • EXCELLENCE
            </span>
          </div>
        </div>
      </div>

      {/* The Sleek Jet Airplane */}
      <div 
        className="absolute z-30 pointer-events-none transition-transform will-change-transform"
        style={{
          left: `${cx}%`,
          top: `${cy}%`,
          transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
        }}
      >
        {/* Airplane Silhouette / Vector with Afterburner Glow */}
        <div className="relative flex items-center">
          {/* Jet Engine Glow */}
          <div className="absolute -left-6 w-8 h-2.5 bg-gradient-to-r from-rose-500 via-amber-400 to-transparent rounded-full blur-[2px] animate-pulse" />

          {/* Custom Sleek Jet SVG */}
          <svg 
            className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </div>

      {/* Bottom Subtle Flight Progress Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
        <span>Initializing Flight Systems • {Math.round(progress)}%</span>
      </div>
    </div>
  );
}
