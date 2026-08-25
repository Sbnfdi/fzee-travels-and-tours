'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Sparkles, Clock, ShieldCheck, Tag, ArrowRight, AlertCircle } from 'lucide-react';
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

  // Calculate remaining time until end of 6th September (23:59:59 PKT)
  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date();
    const year = now.getFullYear();
    // September is month index 8 (0-indexed: Jan=0, Aug=7, Sep=8)
    const target = new Date(year, 8, 6, 23, 59, 59);

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

    // Show popup after smooth 600ms delay on every refresh
    const timer = setTimeout(() => {
      setIsOpen(true);
      requestAnimationFrame(() => setIsAnimating(true));
    }, 600);

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
    }, 400);
  };

  if (!isOpen || !isMounted) return null;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
      {/* Frosted Glass Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Modal Dialog Card — Transparent Whitish Frosted Glass (Side-by-Side on desktop) */}
      <div className={`relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[760px] lg:max-w-[820px] my-auto transition-all duration-500 ease-out ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'}`}>
        
        {/* Multi-layered Soft Ambient Light Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-white/60 via-emerald-200/40 to-amber-200/40 rounded-3xl blur-2xl opacity-80 pointer-events-none" />
        
        {/* Main Card Container — Glassmorphism Whitish Semi-Transparent */}
        <div className="relative bg-white/85 dark:bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_25px_80px_rgba(0,0,0,0.22),0_0_40px_rgba(255,255,255,0.6)] rounded-2xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col md:grid md:grid-cols-12 text-slate-900">
          
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-slate-700 hover:text-white hover:bg-red-600 backdrop-blur-md transition-all duration-300 shadow-md border border-slate-200/80 hover:border-red-500 hover:scale-110 active:scale-95"
            aria-label="Close promotion"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          {/* Left Column: Visual Flyer Poster */}
          <div className="md:col-span-5 relative bg-gradient-to-b from-slate-50/70 to-slate-100/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 border-b md:border-b-0 md:border-r border-slate-200/70 group overflow-hidden">
            <div className="relative w-full flex items-center justify-center rounded-xl overflow-hidden shadow-sm bg-white/40 border border-white/60">
              <Image 
                src="/defence-day-sale.jpg" 
                alt="FZEE Travels Defence Day Sale - 10% OFF Domestic Air Tickets" 
                width={600}
                height={900}
                className="w-full h-auto max-h-[240px] sm:max-h-[280px] md:max-h-[400px] object-contain transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 360px"
              />
            </div>
          </div>

          {/* Right Column: Promotional Details, Countdown & CTAs */}
          <div className="md:col-span-7 flex flex-col justify-between p-4 sm:p-5 md:p-6 bg-white/60 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header Title & Badge */}
            <div className="pr-8 mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl sm:text-2xl">🇵🇰</span>
                {timeLeft.isExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-red-800">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    Sale Ended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                    Limited Time Offer
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                6th September <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">Defence Day Sale</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed">
                {timeLeft.isExpired ? (
                  <span>
                    This Defence Day special discount has concluded. Contact us for <strong className="text-red-700 font-bold">today&apos;s lowest fares</strong>!
                  </span>
                ) : (
                  <span>
                    Get <strong className="text-emerald-700 font-bold">10% OFF</strong> on Domestic Air Tickets. Travel different, experience more!
                  </span>
                )}
              </p>
            </div>

            {/* Countdown Timer Box or Expired Notice */}
            {timeLeft.isExpired ? (
              <div className="bg-white/90 border border-red-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 my-2 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                      Promotion Status:
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    Ended 06 Sep 11:59 PM
                  </span>
                </div>
                <div className="bg-red-50/80 border border-red-200 rounded-xl p-3 text-center">
                  <div className="inline-flex items-center gap-2 text-red-700 font-black text-sm sm:text-base uppercase tracking-wider mb-1">
                    <AlertCircle className="w-4 h-4" />
                    Sale Concluded
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                    The 6th September countdown has ended. You can still reach out to book the best regular flight fares!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 border border-emerald-300/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 my-2 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />
                    <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                      Sale Ends In:
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                    Ends 06 Sep 11:59 PM
                  </span>
                </div>

                {/* 4 Digit Timer Cards */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'DAYS', val: timeLeft.days },
                    { label: 'HOURS', val: timeLeft.hours },
                    { label: 'MINS', val: timeLeft.minutes },
                    { label: 'SECS', val: timeLeft.seconds },
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="relative bg-slate-900 border border-slate-700 rounded-xl p-2 text-center shadow-md group"
                    >
                      <span className="block font-mono text-xl sm:text-2xl md:text-3xl font-black text-amber-300 tracking-tight drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]">
                        {padZero(item.val)}
                      </span>
                      <span className="block text-[9px] sm:text-[10px] font-extrabold text-emerald-400 tracking-widest uppercase mt-0.5">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-3 gap-2 my-2">
              <div className="flex items-center gap-1.5 bg-white/90 border border-emerald-200 rounded-xl p-2 shadow-xs">
                <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-950 truncate">10% Domestic OFF</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 border border-amber-200 rounded-xl p-2 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-950 truncate">Limited Seats</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 border border-red-200 rounded-xl p-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-red-950 truncate">Best Fares</span>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-slate-200/80 mt-2">
              
              {/* Direct Phone Call Button */}
              <a 
                href="tel:03304084080"
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 hover:border-emerald-500 rounded-xl px-3 py-2.5 transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm text-slate-900"
              >
                <Phone className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="block text-[9px] text-slate-500 font-semibold leading-none">Call Direct</span>
                  <span className="block text-xs sm:text-sm font-black text-slate-900 leading-tight">0330-4084080</span>
                </div>
              </a>

              {/* Primary WhatsApp Booking CTA */}
              <a 
                href={
                  timeLeft.isExpired
                    ? "https://wa.me/923304084080?text=Hi%20FZEE%20Travels!%20I%27d%20like%20to%20inquire%20about%20current%20flight%20ticket%20rates%20and%20best%20available%20deals."
                    : "https://wa.me/923304084080?text=Hi%20FZEE%20Travels!%20I%27m%20interested%20in%20the%206th%20September%20Defence%20Day%20Sale%2010%25%20discount%20on%20domestic%20air%20tickets."
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl px-3.5 py-3 font-black text-xs sm:text-sm transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 border border-emerald-400/40 uppercase tracking-wider group"
              >
                <svg className="w-4 h-4 shrink-0 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>{timeLeft.isExpired ? 'Inquire Best Rates' : 'Book Deal Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
