'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-auto relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Top Bar */}
      <div className="bg-black/40 border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
          <div className="tracking-[0.2em] uppercase text-white/50">
            10+ Years Of Trust
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <a href="tel:03304084080" className="flex items-center justify-center gap-2 hover:text-white text-white/70 transition-colors duration-200">
              <Phone className="w-4 h-4 text-primary" />
              <span className="tracking-widest uppercase">Call Support 24/7</span>
            </a>
            <a href="mailto:info@fzeetravels.com" className="flex items-center justify-center gap-2 hover:text-white text-white/70 transition-colors duration-200">
              <Mail className="w-4 h-4 text-primary" />
              <span className="tracking-widest uppercase">Email Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Logo Area */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <Link href="/" className="flex flex-col group">
              <span className="text-6xl md:text-7xl font-black text-white drop-shadow-md leading-none tracking-tighter group-hover:text-primary transition-colors">fzee</span>
              <span className="text-xs md:text-sm uppercase font-extrabold text-white/50 tracking-[0.3em] mt-1">Travels & Tours</span>
            </Link>
            <p className="text-sm text-white/60 max-w-sm font-medium leading-relaxed mt-4">
              Your premium B2B portal for seamless group bookings, comprehensive flight inventories, and exclusive global hotel access.
            </p>
          </div>

          {/* Links Area */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm font-bold text-white/60">
            <div className="flex flex-col items-center sm:items-start gap-4">
              <h4 className="text-white font-black uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Company</h4>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">About Us</Link>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">Careers</Link>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">Blog</Link>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4">
              <h4 className="text-white font-black uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Services</h4>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">B2B Portal</Link>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">Flights</Link>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">Tours</Link>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4">
              <h4 className="text-white font-black uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Legal</h4>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors uppercase tracking-wider text-xs">Refund Policy</Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="bg-black/60 py-4 text-center text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} Fzee Travels and Tours. All rights reserved.
      </div>
    </footer>
  );
}
