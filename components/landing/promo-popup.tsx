'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Globe, Sparkles, Clock, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  // Calculate remaining time until August 14th 23:59:59 PKT
  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date();
    const year = now.getFullYear();
    // August is month index 7 (0-indexed)
    let target = new Date(year, 7, 14, 23, 59, 59);

    if (now > target) {
      target = new Date(year + 1, 7, 14, 23, 59, 59);
    }

    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isExpired: false };
  };

  useEffect(() => {
    setIsMounted(true);
    setTimeLeft(calculateTimeLeft());

    // Respect user dismissal for current session if set
    const isDismissed = sessionStorage.getItem('fzee_azadi_promo_dismissed');
    if (isDismissed === 'true') {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      requestAnimationFrame(() => setIsAnimating(true));
    }, 1000);

    const countdownInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem('fzee_azadi_promo_dismissed', 'true');
    }, 400);
  };

  if (!isOpen || !isMounted) return null;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop with ultra backdrop blur */}
      <div 
        className={`fixed inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Modal Dialog Card */}
      <div className={`relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[430px] my-auto transition-all duration-500 ease-out ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'}`}>
        
        {/* Multi-layered Ambient Light Glows */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 via-amber-400/30 to-emerald-500/40 rounded-3xl blur-2xl opacity-75 pointer-events-none animate-pulse" />
        
        {/* Main Card Container */}
        <div className="relative bg-slate-950 border border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-[0_25px_100px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.2)] overflow-hidden max-h-[90vh] flex flex-col">
          
          {/* Top Luxury Banner Strip */}
          <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-4 py-2.5 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">🇵🇰</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                    14th August Azadi Sale
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[9px] text-emerald-300/80 font-medium">FZEE Travels & Tours Exclusive</p>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="relative z-20 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-red-600/90 backdrop-blur-md transition-all duration-300 shadow-md border border-white/10 hover:border-red-500/50 hover:scale-105 active:scale-95"
              aria-label="Close promotion"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable Content Container for exact screen fitting */}
          <div className="overflow-y-auto custom-scrollbar flex-1 p-3.5 sm:p-4 space-y-3 sm:space-y-3.5">
            
            {/* Live Countdown Timer Grid */}
            <div className="bg-slate-900/90 border border-emerald-500/25 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-amber-500/5 to-emerald-500/5 pointer-events-none" />
              
              {/* Countdown Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 tracking-wide uppercase">
                    Offer Expires In:
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Ends 14 Aug
                </span>
              </div>

              {/* 4 Digit Glass Cards Grid */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[
                  { label: 'DAYS', val: timeLeft.days },
                  { label: 'HOURS', val: timeLeft.hours },
                  { label: 'MINS', val: timeLeft.minutes },
                  { label: 'SECS', val: timeLeft.seconds },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="relative bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/30 rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-center shadow-lg group hover:border-amber-400/50 transition-colors"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                    <span className="block font-mono text-lg sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]">
                      {padZero(item.val)}
                    </span>
                    <span className="block text-[8px] sm:text-[9px] font-extrabold text-emerald-400 tracking-wider uppercase mt-0.5">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Poster Image Container */}
            <div className="relative w-full bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 group shadow-xl">
              <Image 
                src="/azadi-sale.jpg" 
                alt="FZEE Travels Azadi Sale - 10% OFF Domestic Air Tickets (10th-14th August)" 
                width={600}
                height={1067}
                className="w-full h-auto max-h-[300px] sm:max-h-[340px] object-contain bg-slate-950 transition-transform duration-700 group-hover:scale-[1.02]"
                priority
                sizes="(max-width: 400px) 100vw, 430px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 pointer-events-none" />
            </div>

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-1.5">
                <Tag className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-200 truncate">10% OFF Air</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-1.5">
                <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-200 truncate">Zero Extra Fees</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-1.5">
                <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold text-yellow-200 truncate">Instant Booking</span>
              </div>
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="relative px-3.5 pb-3.5 pt-2 bg-slate-950 border-t border-emerald-500/20">
            <div className="flex items-center gap-2">
              
              {/* Direct Phone Call Button */}
              <a 
                href="tel:03304084080"
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-white/15 hover:border-emerald-400/40 rounded-xl px-2.5 py-2.5 transition-all duration-300 flex items-center justify-center gap-1.5 group"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-[8px] text-slate-400 font-medium leading-none">Call Direct</span>
                  <span className="block text-[11px] font-black text-white leading-tight">0330-4084080</span>
                </div>
              </a>

              {/* Primary WhatsApp Booking CTA Button */}
              <a 
                href="https://wa.me/923304084080?text=Hi%20FZEE%20Travels!%20I%27m%20interested%20in%20the%2014th%20August%20Azadi%20Sale%20discount."
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-white rounded-xl px-3 py-2.5 font-black text-[11px] sm:text-xs transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] flex items-center justify-center gap-1.5 hover:scale-[1.03] active:scale-95 border border-emerald-300/30 uppercase tracking-wider group"
              >
                <svg className="w-4 h-4 shrink-0 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Book Deal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

