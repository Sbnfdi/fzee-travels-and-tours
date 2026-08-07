'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-auto">
      {/* Top Black Bar */}
      <div className="bg-slate-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
          <div className="tracking-widest uppercase text-slate-400">
            10+ Years Of Trust
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <a href="tel:03304084080" className="flex items-center justify-center gap-2 hover:text-primary transition-colors duration-200">
              <Phone className="w-4 h-4 text-primary" />
              <span className="tracking-wide">Call Support 24/7</span>
            </a>
            <a href="mailto:info@fzeetravels.com" className="flex items-center justify-center gap-2 hover:text-primary transition-colors duration-200">
              <Mail className="w-4 h-4 text-primary" />
              <span className="tracking-wide">Email Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer with Cityscape Background */}
      <div className="relative bg-slate-50 py-16 md:py-20 border-t-4 border-primary overflow-hidden">
        {/* Cityscape Background image overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none bg-bottom bg-repeat-x"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000&auto=format&fit=crop')",
            backgroundSize: 'contain'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Logo Area */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <Link href="/" className="flex flex-col group">
              <span className="text-6xl md:text-7xl font-black text-primary leading-none tracking-tighter group-hover:opacity-90 transition-opacity">fzee</span>
              <span className="text-xs md:text-sm uppercase font-extrabold text-slate-500 tracking-[0.3em] mt-1">Travels & Tours</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm font-medium leading-relaxed">
              Your premium B2B portal for seamless group bookings, comprehensive flight inventories, and exclusive global hotel access.
            </p>
          </div>

          {/* Links Area */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm font-semibold text-slate-600">
            <div className="flex flex-col items-center sm:items-start gap-4">
              <h4 className="text-slate-900 font-black uppercase tracking-wider mb-2">Company</h4>
              <Link href="#" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="#" className="hover:text-primary transition-colors">Careers</Link>
              <Link href="#" className="hover:text-primary transition-colors">Blog</Link>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4">
              <h4 className="text-slate-900 font-black uppercase tracking-wider mb-2">Services</h4>
              <Link href="#" className="hover:text-primary transition-colors">B2B Portal</Link>
              <Link href="#" className="hover:text-primary transition-colors">Flights Inventory</Link>
              <Link href="#" className="hover:text-primary transition-colors">Group Tours</Link>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-4">
              <h4 className="text-slate-900 font-black uppercase tracking-wider mb-2">Legal</h4>
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Refund Policy</Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="bg-slate-200 py-4 text-center text-xs text-slate-600 font-bold uppercase tracking-wider">
        © {new Date().getFullYear()} Fzee Travels and Tours. All rights reserved.
      </div>
    </footer>
  );
}
