'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the promo this session
    const hasSeenPromo = sessionStorage.getItem('azadi_promo_seen');
    
    if (!hasSeenPromo) {
      // Small delay to let the page load before popping up
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('azadi_promo_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl bg-slate-900 border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(var(--primary),0.2)] overflow-hidden animate-in zoom-in-95 fade-in duration-500 flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black hover:text-white backdrop-blur-md transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Promo Image */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-slate-950 flex flex-col items-center justify-center overflow-hidden group">
          {/* Fallback styling in case image doesn't load instantly */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-green-500/20 opacity-50 pointer-events-none" />
          
          <img 
            src="/azadi-sale.jpg" 
            alt="Azadi Sale - 10% OFF on Domestic Air Tickets" 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              // Fallback if the user hasn't placed the image yet
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('p-8', 'text-center');
              e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<h2 class="text-3xl font-black text-white mb-2">AZADI SALE!</h2><p class="text-primary font-bold text-xl">10% OFF Domestic Flights</p><p class="text-sm text-slate-400 mt-4">(Please place your uploaded flyer as <b>public/azadi-sale.jpg</b>)</p>');
            }}
          />
        </div>

        {/* CTA Bar */}
        <div className="bg-slate-950 p-4 sm:p-5 flex items-center justify-between gap-4 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-white text-sm sm:text-base leading-tight">Celebrate Freedom!</h3>
            <p className="text-xs text-slate-400 mt-0.5">Limited seats available till 14th Aug</p>
          </div>
          <Link 
            href="/register" 
            onClick={handleClose}
            className="relative z-10 shrink-0 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 uppercase tracking-wider"
          >
            Claim Offer
          </Link>
        </div>

      </div>
    </div>
  );
}
