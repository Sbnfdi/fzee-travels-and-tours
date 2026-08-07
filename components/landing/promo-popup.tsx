'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Globe } from 'lucide-react';
import Image from 'next/image';

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show every time the page loads with a small delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      requestAnimationFrame(() => setIsAnimating(true));
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 xs:p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Modal Container — responsive width & max-height so it never overflows the viewport */}
      <div className={`relative w-full max-w-[92vw] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] max-h-[92vh] sm:max-h-[90vh] flex flex-col transition-all duration-500 ease-out ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'}`}>
        
        {/* Glow Ring */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-green-500/40 via-primary/30 to-green-500/40 rounded-[1.5rem] sm:rounded-[2rem] blur-xl opacity-60 pointer-events-none" />
        
        {/* Card */}
        <div className="relative bg-slate-950 border border-white/15 rounded-[1.25rem] sm:rounded-[1.75rem] shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
          
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-black/60 text-white/90 hover:bg-red-600 hover:text-white backdrop-blur-md transition-all duration-300 shadow-lg border border-white/10 hover:border-red-500/50 hover:scale-110"
            aria-label="Close promotion"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          {/* Main Promo Image — scrollable if too tall */}
          <div className="relative w-full overflow-y-auto overflow-x-hidden flex-1 min-h-0">
            <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
              <Image 
                src="/azadi-sale.jpg" 
                alt="Azadi Sale - Celebrate Freedom! Get 10% OFF on Domestic Air Tickets. Offer valid 10th-14th August 2026." 
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 360px) 92vw, (max-width: 420px) 360px, (max-width: 460px) 420px, 460px"
              />
            </div>
            
            {/* Subtle gradient fade at the bottom to merge with CTA */}
            <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none sticky" />
          </div>

          {/* CTA Bar — always visible at the bottom */}
          <div className="relative px-3 pb-3 pt-1 sm:px-5 sm:pb-5 sm:pt-2 bg-slate-950 shrink-0">
            {/* Decorative accent line */}
            <div className="absolute top-0 left-3 right-3 sm:left-5 sm:right-5 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            
            <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              {/* Contact Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">0330-4084080</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] text-white/60 font-medium truncate">fzeetravelandtours.com</span>
                </div>
              </div>

              {/* CTA Button */}
              <a 
                href="https://wa.me/923304084080?text=Hi%20FZEE%20Travels!%20I%27m%20interested%20in%20the%20Azadi%20Sale%20offer."
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="shrink-0 bg-green-600 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs hover:bg-green-500 transition-all duration-300 shadow-lg shadow-green-600/30 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 border border-green-400/20"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Book Now
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
